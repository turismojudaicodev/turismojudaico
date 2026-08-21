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

// Función para construir el correo en formato crudo (requerido por Gmail API)
const makeRawEmail = (to, subject, htmlBody, bcc = '') => {
  const str = [
    `To: ${to}`,
    `From: ${process.env.GMAIL_USER}`,
    bcc ? `Bcc: ${bcc}` : '',
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody,
  ]
    .filter(Boolean)
    .join('\n')

  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// Envía un correo directo
export const sendDirectEmail = async (to, subject, htmlBody, bcc = '') => {
  const raw = makeRawEmail(to, subject, htmlBody, bcc)
  return await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })
}

// Guarda un borrador en la carpeta "Drafts"
export const createDraftEmail = async (to, subject, htmlBody) => {
  const raw = makeRawEmail(to, subject, htmlBody)
  return await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: { raw },
    },
  })
}