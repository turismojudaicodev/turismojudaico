import { findDraftByBookingId } from '../../../../../lib/gmail';

export default async function handler(req, res) {
  const { id, draftId } = req.query;
  const ids = await findDraftByBookingId(id);
  
  const finalMessageId = (ids && ids.messageId) ? ids.messageId : draftId;
  
  if (finalMessageId && finalMessageId !== 'null' && finalMessageId !== 'undefined') {
    res.redirect(307, `https://mail.google.com/mail/u/?authuser=info@turismojudaico.com#drafts?compose=${finalMessageId}`);
  } else {
    res.redirect(307, `https://mail.google.com/mail/u/?authuser=info@turismojudaico.com#drafts`);
  }
}