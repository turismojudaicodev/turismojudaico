import crypto from 'crypto'
import { google } from 'googleapis'

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
)

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
})

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client })

// ---------- Armado del mensaje ----------

/** Quita saltos de línea para que nadie pueda inyectar headers extra (Bcc, etc.). */
const headerValue = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim()

const encodeSubject = (subject) =>
  `=?utf-8?B?${Buffer.from(headerValue(subject)).toString('base64')}?=`

const toBase64Url = (str) =>
  Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

/**
 * Arma el mensaje en formato RFC 2822 codificado como pide la API de Gmail.
 * @param {{ to: string, subject: string, html: string, bcc?: string,
 *           attachments?: { filename: string, mimeType: string, content: Buffer }[] }} message
 */
function buildRawEmail({ to, subject, html, bcc = '', attachments = [] }) {
  const headers = [
    `To: ${headerValue(to)}`,
    `From: ${headerValue(process.env.GMAIL_USER)}`,
    bcc && `Bcc: ${headerValue(bcc)}`,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
  ].filter(Boolean)

  if (attachments.length === 0) {
    return toBase64Url([...headers, 'Content-Type: text/html; charset=utf-8', '', html].join('\n'))
  }

  const boundary = `boundary_${crypto.randomUUID()}`
  const parts = [
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
    ...attachments.flatMap(({ filename, mimeType, content }) => [
      `--${boundary}`,
      `Content-Type: ${mimeType}; name="${headerValue(filename)}"`,
      `Content-Disposition: attachment; filename="${headerValue(filename)}"`,
      'Content-Transfer-Encoding: base64',
      '',
      content.toString('base64'),
    ]),
    `--${boundary}--`,
  ]

  return toBase64Url(
    [...headers, `Content-Type: multipart/mixed; boundary="${boundary}"`, '', ...parts].join('\n')
  )
}

// ---------- Referencia de reserva ----------

/** Código sin guiones que se incluye en cada mail para poder encontrar el hilo en Gmail. */
export const bookingRef = (uuid) => String(uuid).replace(/-/g, '')

export const withBookingRef = (html, uuid) =>
  `${html}<br><br><span style="color:#cccccc; font-size:10px;">Ref: ${bookingRef(uuid)}</span>`

// ---------- Envío ----------

export async function sendDirectEmail(to, subject, html, bcc = '') {
  return gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: buildRawEmail({ to, subject, html, bcc }) },
  })
}

export async function sendEmailWithAttachments(to, subject, html, attachments) {
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: buildRawEmail({ to, subject, html, attachments }) },
  })
  return res.data
}

/** Crea un borrador en Gmail y devuelve su id (el que sirve para enviarlo después). */
export async function createDraftEmail(to, subject, html) {
  const response = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: { message: { raw: buildRawEmail({ to, subject, html }) } },
  })
  return response.data.id
}

export async function sendExistingDraft(draftId) {
  try {
    await gmail.users.drafts.send({ userId: 'me', requestBody: { id: draftId } })
    return true
  } catch (error) {
    console.error('Error enviando el borrador:', error)
    return false
  }
}

/** Devuelve el id del mensaje de un borrador (Gmail lo usa en la URL para abrirlo). */
export async function getDraftMessageId(draftId) {
  try {
    const draft = await gmail.users.drafts.get({ userId: 'me', id: draftId, format: 'minimal' })
    return draft.data.message.id
  } catch {
    return null
  }
}

// ---------- Búsqueda ----------

/**
 * Busca el borrador de una reserva por su referencia en el cuerpo.
 * Solo se usa para reservas viejas que no tienen guardado el id del borrador.
 */
export async function findDraftByBookingId(bookingId) {
  try {
    const ref = bookingRef(bookingId)
    const response = await gmail.users.drafts.list({ userId: 'me', q: `"${ref}"`, maxResults: 5 })
    const draft = response.data.drafts?.[0]
    if (!draft) return null

    const messageId = await getDraftMessageId(draft.id)
    return { draftId: draft.id, messageId }
  } catch (error) {
    console.error('Error buscando el borrador:', error)
    return null
  }
}

export async function findThreadByBookingId(bookingId) {
  try {
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `"${bookingRef(bookingId)}"`,
      maxResults: 1,
    })
    return response.data.messages?.[0]?.threadId ?? null
  } catch (error) {
    console.error('Error buscando el hilo de correo:', error)
    return null
  }
}
