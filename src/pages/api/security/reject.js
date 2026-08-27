import { db } from '../../../../lib/mysql';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) return res.status(400).send('Missing ID');

  try {
    // 🚀 Movemos la tarjeta a un estado de alerta o rechazo
    await db.promise().query(`UPDATE bookings_pipeline SET status = 'SECURITY_REJECTED' WHERE booking_uuid = ?`, [id]);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`
      <div style="text-align: center; font-family: Arial; margin-top: 100px; color: #333;">
        <h1 style="color: #e74c3c;">❌ Security Rejected</h1>
        <p>The security clearance has been marked as rejected or missing data.</p>
        <p style="color: #7f8c8d; font-size: 14px;">The operations team has been notified. You can close this window.</p>
      </div>
    `);
  } catch (error) {
    console.error('Error rechazando seguridad:', error);
    res.status(500).send('Internal Server Error');
  }
}