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

const makeRawEmail = (to, subject, htmlBody, bcc = '') => {

  const headers = [
    `To: ${to}`,
    `From: ${process.env.GMAIL_USER}`,
    bcc ? `Bcc: ${bcc}` : '',
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
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
  const response = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: { raw },
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

export const sendEmailWithAttachment = async (to, subject, htmlBody, pdfBuffer, filename) => {
  const boundary = 'jewishtours_boundary_12345'; // Un separador invisible para que Gmail entienda qué es texto y qué es archivo
  
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
    `--${boundary}`,
    `Content-Type: application/pdf; name="${filename}"`,
    `Content-Disposition: attachment; filename="${filename}"`,
    'Content-Transfer-Encoding: base64',
    '',
    pdfBuffer.toString('base64'), // Transformamos el PDF a texto para que viaje por internet
    '',
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