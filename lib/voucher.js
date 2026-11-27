// Confirmación (rta 3 de las plantillas): sale cuando la seña está registrada y el guía está elegido en el panel.
// - Automática (al entrar la seña o al elegir el guía): si falta el guía, espera; si está todo, sale directo.
// - Si la plantilla no tiene el párrafo del guía, queda como BORRADOR para completarlo a mano.
// Lo usan el webhook de Stripe, la carga de pagos del panel, el selector de guía y el botón "Armar Voucher".
import { db } from './mysql'
import { createDraftEmail, sendDirectEmail } from './gmail'
import { refFooter } from './html'
import { getPayments, paymentSummary } from './payments'
import { confirmationMail } from './mails/index'
import { cityOf } from './mails/flags'

const q = async (sql, params = []) => (await db.promise().query(sql, params))[0]

// Ciudades donde el guía se confirma unas semanas antes: la confirmación sale sin guía.
const NO_GUIDE_CITIES = ['montevideo', 'puntadeleste']

export async function getGuide(id) {
  if (!id) return null
  const rows = await q('SELECT id, full_name, phone, email, city FROM guides WHERE id = ?', [id])
  return rows[0] || null
}

/**
 * Manda (o deja en borrador) la confirmación y pasa la reserva a CONFIRMED_ASSIGNED. Solo desde DEPOSIT_PAID.
 * mode: 'auto' (si falta el guía no hace nada) o 'manual' (botón del panel: si falta el guía, error).
 * Devuelve { ok, status, error?, waiting?, sent?, draftId?, review? }.
 */
export async function sendConfirmation(uuid, { mode = 'auto' } = {}) {
  const rows = await q('SELECT * FROM bookings_pipeline WHERE booking_uuid = ?', [uuid])
  const booking = rows[0]
  if (!booking) return { ok: false, status: 404, error: 'Reserva no encontrada' }
  if (booking.status !== 'DEPOSIT_PAID') {
    return { ok: false, status: 409, error: `La reserva está en ${booking.status}; la confirmación sale cuando la seña está registrada ("Seña recibida")` }
  }
  const guide = await getGuide(booking.guide_id)
  const needsGuide = !NO_GUIDE_CITIES.includes(cityOf(booking.destination_name).slug)
  if (needsGuide && !guide) {
    if (mode === 'auto') return { ok: true, status: 200, waiting: true }
    return { ok: false, status: 409, error: 'Elegí el guía de la reserva antes de mandar la confirmación.' }
  }

  const summary = paymentSummary(booking, await getPayments(uuid))
  const mail = confirmationMail(booking, summary, guide)
  const html = mail.html + refFooter(uuid)

  // Primero el mail: si Gmail falla, la reserva no queda "confirmada" sin confirmación.
  let draftId = null
  if (mail.review) draftId = await createDraftEmail(booking.client_email, mail.subject, html)
  else await sendDirectEmail(booking.client_email, mail.subject, html)
  await q("UPDATE bookings_pipeline SET status = 'CONFIRMED_ASSIGNED', gmail_draft_id = COALESCE(?, gmail_draft_id) WHERE booking_uuid = ? AND status = 'DEPOSIT_PAID'", [
    draftId,
    uuid,
  ])
  return { ok: true, status: 200, sent: !draftId, draftId, review: mail.review }
}

/** Botón "Armar Voucher" del panel (por si falló Gmail o para mandarla a mano). */
export const createVoucherDraft = (uuid) => sendConfirmation(uuid, { mode: 'manual' })

/** Después de registrar un pago: si la seña recién quedó completa, manda la confirmación (si ya hay guía). No tira errores. */
export async function afterPaymentSynced({ depositJustPaid }, uuid) {
  if (!depositJustPaid) return { voucher: false }
  try {
    const r = await sendConfirmation(uuid, { mode: 'auto' })
    return { voucher: !!(r.ok && !r.waiting), sent: !!r.sent, waitingGuide: !!r.waiting }
  } catch (error) {
    console.error('Confirmación automática: no se pudo mandar (queda en "Seña recibida")', error)
    return { voucher: false }
  }
}
