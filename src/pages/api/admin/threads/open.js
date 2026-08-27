import { findThreadByBookingId } from '../../../../../lib/gmail';

export default async function handler(req, res) {
  const { id } = req.query;
  console.log(`🔎 Buscando historial para ID:`, id);

  const threadId = await findThreadByBookingId(id);

  if (threadId) {
    // #all/ abre el correo directamente en pantalla completa
    res.redirect(307, `https://mail.google.com/mail/u/?authuser=info@turismojudaico.com#all/${threadId}`);
  } else {
    const cleanId = String(id).replace(/-/g, '');
    res.redirect(307, `https://mail.google.com/mail/u/?authuser=info@turismojudaico.com#search/${cleanId}`);
  }
}