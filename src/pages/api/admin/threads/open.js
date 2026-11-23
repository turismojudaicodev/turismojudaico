import { bookingRef, findThreadByBookingId } from '../../../../../lib/gmail'

const GMAIL_URL = 'https://mail.google.com/mail/u/?authuser=info@turismojudaico.com'

/** Redirige al hilo de Gmail de una reserva, o a una búsqueda por su referencia. */
export default async function handler(req, res) {
  const { id } = req.query
  const threadId = await findThreadByBookingId(id)

  res.redirect(307, threadId ? `${GMAIL_URL}#all/${threadId}` : `${GMAIL_URL}#search/${bookingRef(id)}`)
}
