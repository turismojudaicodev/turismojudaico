import { query } from '../../../../lib/mysql'
import { BOOKING_STATUS, getBookingById } from '../../../../lib/bookings'
import { createDraftEmail, withBookingRef } from '../../../../lib/gmail'
import { escapeHtml } from '../../../../lib/html'

/**
 * Confirma el pago y deja el voucher como borrador en Gmail,
 * para completar a mano los datos del guía antes de enviarlo.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  try {
    const booking = await getBookingById(req.body.id)
    if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' })
    if (booking.status !== BOOKING_STATUS.PENDING_DEPOSIT) {
      return res.status(409).json({ error: `La reserva está en estado ${booking.status}, no esperando pago.` })
    }

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #28a745;">Tour Confirmed!</h2>
        <p>Hi ${escapeHtml(booking.client_name)},</p>
        <p>Your payment has been received and your tour in <b>${escapeHtml(booking.destination_name)}</b> is officially confirmed.</p>

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
            <td style="padding: 8px;"><b>Pending Balance:</b></td>
            <td style="padding: 8px;">[COMPLETAR SALDO] USD (Cash to the guide)</td>
          </tr>
        </table>

        <p>We wish you an amazing experience connecting with your roots!</p>
        <p>Best regards,<br>Judaic Tourism Team</p>
      </div>`

    const draftId = await createDraftEmail(
      booking.client_email,
      `CONFIRMATION VOUCHER - Jewish Tour in ${booking.destination_name}`,
      withBookingRef(html, booking.booking_uuid)
    )
    await query('UPDATE bookings_pipeline SET status = ?, gmail_draft_id = ? WHERE id = ?', [
      BOOKING_STATUS.CONFIRMED_ASSIGNED,
      draftId,
      booking.id,
    ])

    return res.status(200).json({ success: true, draftId })
  } catch (error) {
    console.error('Error generando el voucher:', error)
    return res.status(500).json({ error: 'Error al generar el voucher' })
  }
}
