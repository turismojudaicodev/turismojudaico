import { db } from '../../../../lib/mysql'
import { sendDirectEmail } from '../../../../lib/gmail'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { id, email, name, destination } = req.body

  const query = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => err ? reject(err) : resolve(results))
  })

  try {
    await query(`UPDATE bookings_pipeline SET status = 'PENDING_DEPOSIT' WHERE id = ?`, [id])

    const subject = `Payment Details - Jewish Tour in ${destination}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <p>Hi ${name},</p>
        <p>Your security check is complete and we are ready to proceed with your booking for <b>${destination}</b>.</p>
        <p>To secure your date, please complete the payment using the following link:</p>
        <h3><a href="#">[MOCKUP - LINK DE STRIPE / PAYPAL AQUÍ]</a></h3>
        <p>Please let us know once the payment is done.</p>
        <p>Best regards,<br>Judaic Tourism Team</p>
      </div>
    `;

    // AHORA SE ENVÍA DIRECTO AL CLIENTE
    await sendDirectEmail(email, subject, html)

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al generar el cobro' })
  }
}