import { query } from '../../../../lib/mysql'
import { BOOKING_STATUS, getBookingById } from '../../../../lib/bookings'
import { sendDirectEmail, withBookingRef } from '../../../../lib/gmail'
import { escapeHtml } from '../../../../lib/html'

/** Avisa al cliente que la comunidad no aprobó la visita y cancela la reserva. */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    const booking = await getBookingById(req.body.id)
    if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' })

    const destination = escapeHtml(booking.destination_name)
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Dear ${escapeHtml(booking.client_name)},</p>
        <p>Thank you for your interest in our Jewish Tour in ${destination} and for submitting your information.</p>
        <p>Unfortunately, after reviewing the details with the local community's security department, we are unable to process the required authorizations for your visit at this time. As we strictly follow the protocols established by the local community, we will not be able to offer the tour on this occasion.</p>
        <p>We sincerely apologize for any inconvenience this may cause your travel plans and appreciate your understanding.</p>
        <p>Best regards,<br><b>Judaic Tourism Operations</b></p>
      </div>`

    await sendDirectEmail(
      booking.client_email,
      `Update regarding your Jewish Tour in ${booking.destination_name}`,
      withBookingRef(html, booking.booking_uuid)
    )
    await query('UPDATE bookings_pipeline SET status = ? WHERE id = ?', [BOOKING_STATUS.CANCELLED, booking.id])

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error enviando rechazo:', error)
    return res.status(500).json({ error: 'Error al enviar el mail de rechazo' })
  }
}
