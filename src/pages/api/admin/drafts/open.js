import { findDraftByBookingId, getDraftMessageId } from '../../../../../lib/gmail'

const GMAIL_DRAFTS_URL = 'https://mail.google.com/mail/u/?authuser=info@turismojudaico.com#drafts'

/** Redirige al borrador de Gmail de una reserva (o a la carpeta de borradores si no lo encuentra). */
export default async function handler(req, res) {
  const { id, draftId } = req.query

  const messageId =
    (draftId && (await getDraftMessageId(draftId))) ||
    (await findDraftByBookingId(id))?.messageId

  res.redirect(307, messageId ? `${GMAIL_DRAFTS_URL}?compose=${messageId}` : GMAIL_DRAFTS_URL)
}
