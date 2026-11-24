import { withAdmin } from '../../../../lib/session'
import { db } from '../../../../lib/mysql'
import { createDraftEmail } from '../../../../lib/gmail'
import { escapeHtml, refFooter } from '../../../../lib/html'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { booking_uuid } = req.body || {}
  if (!booking_uuid) return res.status(400).json({ error: 'Falta el uuid de la reserva' })

  try {
    const [rows] = await db.promise().query(
      `SELECT client_name, client_email, destination_name, status FROM bookings_pipeline WHERE booking_uuid = ?`,
      [booking_uuid]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' })
    const booking = rows[0]
    if (booking.status !== 'PENDING_DEPOSIT') {
      return res.status(409).json({ error: `La reserva está en ${booking.status}, no en "Esperando Pago"` })
    }

    const destination = escapeHtml(String(booking.destination_name).trim())
    const subject = `CONFIRMATION VOUCHER - Jewish Tour in ${String(booking.destination_name).trim()}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #28a745;">Tour Confirmed!</h2>
        <p>Hi ${escapeHtml(booking.client_name)},</p>
        <p>Your payment has been received and your tour in <b>${destination}</b> is officially confirmed.</p>

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
        ${refFooter(booking_uuid)}
      </div>
    `;

    // SE QUEDA COMO BORRADOR PARA QUE LLENES LOS DATOS DEL GUÍA.
    // Primero el borrador: si Gmail falla, la reserva no queda "confirmada" sin voucher.
    const draftId = await createDraftEmail(booking.client_email, subject, html)

    await db.promise().query(
      `UPDATE bookings_pipeline SET status = 'CONFIRMED_ASSIGNED', gmail_draft_id = ? WHERE booking_uuid = ?`,
      [draftId, booking_uuid]
    )

    return res.status(200).json({ success: true, draftId })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al generar el voucher' })
  }
}

export default withAdmin(handler)
