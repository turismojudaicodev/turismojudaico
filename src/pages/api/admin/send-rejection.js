import { withAdmin } from '../../../../lib/session'
import { db } from '../../../../lib/mysql';
import { sendDirectEmail } from '../../../../lib/gmail';
import { escapeHtml, refFooter } from '../../../../lib/html';

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { booking_uuid } = req.body || {};
  if (!booking_uuid) return res.status(400).json({ error: 'Falta el uuid de la reserva' });

  try {
    const [rows] = await db.promise().query(
      `SELECT client_name, client_email, destination_name FROM bookings_pipeline WHERE booking_uuid = ?`,
      [booking_uuid]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    const booking = rows[0];
    const destination = escapeHtml(String(booking.destination_name).trim());

    const subject = `Update regarding your Jewish Tour in ${String(booking.destination_name).trim()}`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Dear ${escapeHtml(booking.client_name)},</p>
        <p>Thank you for your interest in our Jewish Tour in ${destination} and for submitting your information.</p>
        <p>Unfortunately, after reviewing the details with the local community's security department, we are unable to process the required authorizations for your visit at this time. As we strictly follow the protocols established by the local community, we will not be able to offer the tour on this occasion.</p>
        <p>We sincerely apologize for any inconvenience this may cause your travel plans and appreciate your understanding.</p>
        <p>Best regards,<br><b>Judaic Tourism Operations</b></p>
        ${refFooter(booking_uuid)}
      </div>
    `;

    await sendDirectEmail(booking.client_email, subject, htmlBody);
    await db.promise().query(`UPDATE bookings_pipeline SET status = 'CANCELLED' WHERE booking_uuid = ?`, [booking_uuid]);

    res.status(200).json({ message: 'Rejection email sent successfully' });
  } catch (error) {
    console.error('Error enviando rechazo:', error);
    res.status(500).json({ error: 'Error sending email' });
  }
}

export default withAdmin(handler)
