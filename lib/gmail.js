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

// Un salto de línea en "To"/"Bcc" permitiría inyectar cabeceras (ej. "Bcc: tercero@...").
const assertSafeHeader = (value, name) => {
  if (/[\r\n]/.test(String(value || ''))) throw new Error(`Cabecera ${name} inválida`)
}

// thread = { threadId, messageId } de replyInfo()/threadForBooking(): el mail va como respuesta en ese hilo.
const makeRawEmail = (to, subject, htmlBody, bcc = '', thread = null) => {
  assertSafeHeader(to, 'To')
  assertSafeHeader(bcc, 'Bcc')
  const ref = thread?.messageId && !/[\r\n]/.test(thread.messageId) ? thread.messageId : ''

  const headers = [
    `To: ${to}`,
    `From: ${process.env.GMAIL_USER}`,
    bcc ? `Bcc: ${bcc}` : '',
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    ref ? `In-Reply-To: ${ref}` : '',
    ref ? `References: ${ref}` : '',
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8'
  ].filter(Boolean).join('\n');

  const str = `${headers}\n\n${htmlBody}`;

  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export const sendDirectEmail = async (to, subject, htmlBody, bcc = '', thread = null) => {
  const raw = makeRawEmail(to, subject, htmlBody, bcc, thread)
  return await gmail.users.messages.send({
    userId: 'me',
    requestBody: thread?.threadId ? { raw, threadId: thread.threadId } : { raw },
  })
}

// Guarda un borrador en la carpeta "Drafts"
export const createDraftEmail = async (to, subject, htmlBody, thread = null) => {
  const raw = makeRawEmail(to, subject, htmlBody, '', thread)
  const response = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: thread?.threadId ? { raw, threadId: thread.threadId } : { raw },
    },
  })
  return response.data.message.id;
}
export const findDraftByBookingId = async (bookingId) => {
  try {
    const safeId = String(bookingId);
    const cleanRef = safeId.replace(/-/g, '');
    
    const response = await gmail.users.drafts.list({
      userId: 'me',
      maxResults: 20
    });
    
    if (!response.data.drafts || response.data.drafts.length === 0) return null;

    for (const draft of response.data.drafts) {
      const draftData = await gmail.users.drafts.get({
        userId: 'me',
        id: draft.id,
        format: 'full'
      });

      const parts = draftData.data.message.payload.parts;
      let bodyText = "";
      
      if (parts) {
        const htmlPart = parts.find(part => part.mimeType === 'text/html');
        if (htmlPart && htmlPart.body.data) {
           bodyText = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
        }
      } else if (draftData.data.message.payload.body.data) {
        bodyText = Buffer.from(draftData.data.message.payload.body.data, 'base64').toString('utf-8');
      }

      if (bodyText.includes(cleanRef) || bodyText.includes(safeId)) {
        return { 
          draftId: draft.id,
          messageId: draftData.data.message.id 
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error escaneando borradores:", error);
    return null;
  }
}

export const sendExistingDraft = async (draftId) => {
  try {
    await gmail.users.drafts.send({
      userId: 'me',
      requestBody: { id: draftId }
    });
    return true;
  } catch (error) {
    console.error("Error enviando el borrador:", error);
    return false;
  }
}

export const findThreadByBookingId = async (bookingId) => {
  try {
    const cleanRef = String(bookingId).replace(/-/g, '');
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `"${cleanRef}"`
    });
    
    if (response.data.messages && response.data.messages.length > 0) {
      return response.data.messages[0].threadId;
    }
    return null;
  } catch (error) {
    console.error("Error buscando el hilo de correo:", error);
    return null;
  }
}

/** Hilo y Message-ID de un mensaje de Gmail (por su id), para responder en esa conversación. null si falla. */
export const replyInfo = async (gmailMessageId) => {
  if (!gmailMessageId) return null
  try {
    const { data } = await gmail.users.messages.get({ userId: 'me', id: gmailMessageId, format: 'metadata', metadataHeaders: ['Message-ID'] })
    const h = (data.payload?.headers || []).find((x) => x.name.toLowerCase() === 'message-id')
    return { threadId: data.threadId, messageId: h?.value || null }
  } catch (error) {
    console.error('Error leyendo el mensaje para responder:', error)
    return null
  }
}

/** El hilo de la reserva (buscado por la Ref del pie) y el último mensaje, para mandar el siguiente como respuesta. */
export const threadForBooking = async (bookingId) => {
  try {
    const threadId = await findThreadByBookingId(bookingId)
    if (!threadId) return null
    const { data } = await gmail.users.threads.get({ userId: 'me', id: threadId, format: 'metadata', metadataHeaders: ['Message-ID'] })
    const last = (data.messages || []).slice(-1)[0]
    const h = (last?.payload?.headers || []).find((x) => x.name.toLowerCase() === 'message-id')
    return { threadId, messageId: h?.value || null }
  } catch (error) {
    console.error('Error buscando el hilo de la reserva:', error)
    return null
  }
}

// extraAttachments: [{ filename, mimeType, content: Buffer }] (ej. pasaportes subidos en PDF)
export const sendEmailWithAttachment = async (to, subject, htmlBody, pdfBuffer, filename, extraAttachments = []) => {
  assertSafeHeader(to, 'To')
  const boundary = 'jewishtours_boundary_12345'; // Un separador invisible para que Gmail entienda qué es texto y qué es archivo
  const safeName = (name) => String(name || 'file').replace(/["\r\n]/g, '_');

  const attachments = [
    { filename, mimeType: 'application/pdf', content: pdfBuffer },
    ...extraAttachments,
  ];

  const rawEmail = [
    `To: ${to}`,
    `From: ${process.env.GMAIL_USER}`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody,
    '',
    ...attachments.flatMap((a) => [
      `--${boundary}`,
      `Content-Type: ${a.mimeType || 'application/octet-stream'}; name="${safeName(a.filename)}"`,
      `Content-Disposition: attachment; filename="${safeName(a.filename)}"`,
      'Content-Transfer-Encoding: base64',
      '',
      a.content.toString('base64'), // Transformamos el archivo a texto para que viaje por internet
      '',
    ]),
    `--${boundary}--`
  ].join('\n');

  const encodedEmail = Buffer.from(rawEmail)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedEmail },
  });

  return res.data;
};