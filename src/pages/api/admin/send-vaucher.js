import { db } from '../../../../lib/mysql'
import { createDraftEmail } from '../../../../lib/gmail'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { id, email, name, destination } = req.body

  const query = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => err ? reject(err) : resolve(results))
  })

  try {
    await query(`UPDATE bookings_pipeline SET status = 'CONFIRMED_ASSIGNED' WHERE id = ?`, [id])

    const subject = `CONFIRMATION VOUCHER - Jewish Tour in ${destination}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #28a745;">Tour Confirmed!</h2>
        <p>Hi ${name},</p>
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
      </div>
    `;

    // SE QUEDA COMO BORRADOR PARA QUE LLENES LOS DATOS DEL GUÍA
    await createDraftEmail(email, subject, html)

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al generar el voucher' })
  }
}