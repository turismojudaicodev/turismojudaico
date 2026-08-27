import { db } from '../../../../lib/mysql';

export default async function handler(req, res) {
  const { id } = req.query; // Atrapamos el UUID que viene en la URL
  
  if (!id) return res.status(400).send('Missing ID');

  try {
    // 🚀 La magia: Movemos la tarjeta a la columna de Aprobado
    await db.promise().query(`UPDATE bookings_pipeline SET status = 'SECURITY_APPROVED' WHERE booking_uuid = ?`, [id]);
    
    // Le mostramos una web sencilla al guía
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`
      <div style="text-align: center; font-family: Arial; margin-top: 100px; color: #333;">
        <h1 style="color: #27ae60;">✅ Security Approved!</h1>
        <p>Thank you. The security clearance has been registered successfully.</p>
        <p style="color: #7f8c8d; font-size: 14px;">You can close this window now.</p>
      </div>
    `);
  } catch (error) {
    console.error('Error aprobando seguridad:', error);
    res.status(500).send('Internal Server Error');
  }
}