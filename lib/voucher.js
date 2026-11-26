// Voucher de confirmación: se arma como BORRADOR de Gmail (falta completar guía y punto de encuentro).
// Lo usan el botón del panel y el webhook de Stripe (cuando entra la seña se arma solo).
import { db } from './mysql'
import { createDraftEmail } from './gmail'
import { escapeHtml, refFooter } from './html'
import { getPayments, paymentSummary } from './payments'

const q = async (sql, params = []) => (await db.promise().query(sql, params))[0]

const baseUrl = () => process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T12:00:00Z`)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
}

export function voucherHtml(booking, summary) {
  const destination = escapeHtml(String(booking.destination_name).trim())
  const payLink = `${baseUrl()}/pay/${booking.booking_uuid}`
  const balanceRow = summary.balance > 0
    ? `<tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><b>Remaining Balance:</b></td>
            <td style="padding: 8px;">$${summary.balance} USD — due by ${formatDate(summary.balanceDueDate)}</td>
          </tr>`
    : `<tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><b>Balance:</b></td>
            <td style="padding: 8px;">Fully paid ✅</td>
          </tr>`
  const balanceText = summary.balance > 0
    ? `<p>You can pay the remaining balance online (card or Zelle) at <a href="${payLink}">${payLink}</a>,
        or in cash to your guide on the day of the tour.</p>`
    : ''

  return `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #28a745;">Tour Confirmed!</h2>
        <p>Hi ${escapeHtml(booking.client_name)},</p>
        <p>We received your deposit of <b>$${summary.paid} USD</b> and your tour in <b>${destination}</b> is officially confirmed.</p>

        <table style="border-collapse: collapse; width: 100%; max-width: 500px; margin-top: 15px;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><b>Meeting Point:</b></td>
            <td style="padding: 8px;">[MOCKUP - HOTEL O DIRECCIÓN]</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><b>Guide Name:</b></td>
            <td style="padding: 8px;">[COMPLETAR NOMBRE]</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;"><b>Tour Total:</b></td>
            <td style="padding: 8px;">$${summary.total} USD</td>
          </tr>
          ${balanceRow}
        </table>
        ${balanceText}
        <p>We wish you an amazing experience connecting with your roots!</p>
        <p>Best regards,<br>Judaic Tourism Team</p>
        ${refFooter(booking.booking_uuid)}
      </div>
    `
}

/**
 * Arma el borrador del voucher y pasa la reserva a CONFIRMED_ASSIGNED.
 * Solo desde DEPOSIT_PAID (la seña tiene que estar registrada).
 * Devuelve { ok, status, error?, draftId? }.
 */
export async function createVoucherDraft(uuid) {
  const rows = await q('SELECT * FROM bookings_pipeline WHERE booking_uuid = ?', [uuid])
  const booking = rows[0]
  if (!booking) return { ok: false, status: 404, error: 'Reserva no encontrada' }
  if (booking.status !== 'DEPOSIT_PAID') {
    return { ok: false, status: 409, error: `La reserva está en ${booking.status}; el voucher sale cuando la seña está registrada ("Seña recibida")` }
  }

  const summary = paymentSummary(booking, await getPayments(uuid))
  const subject = `CONFIRMATION VOUCHER - Jewish Tour in ${String(booking.destination_name).trim()}`

  // Primero el borrador: si Gmail falla, la reserva no queda "confirmada" sin voucher.
  const draftId = await createDraftEmail(booking.client_email, subject, voucherHtml(booking, summary))
  await q("UPDATE bookings_pipeline SET status = 'CONFIRMED_ASSIGNED', gmail_draft_id = ? WHERE booking_uuid = ? AND status = 'DEPOSIT_PAID'", [
    draftId,
    uuid,
  ])
  return { ok: true, status: 200, draftId }
}

/** Después de registrar un pago: si la seña recién quedó completa, arma el voucher solo. No tira errores. */
export async function afterPaymentSynced({ depositJustPaid }, uuid) {
  if (!depositJustPaid) return { voucher: false }
  try {
    const r = await createVoucherDraft(uuid)
    return { voucher: r.ok }
  } catch (error) {
    console.error('Voucher automático: no se pudo armar el borrador (queda en "Seña recibida")', error)
    return { voucher: false }
  }
}
