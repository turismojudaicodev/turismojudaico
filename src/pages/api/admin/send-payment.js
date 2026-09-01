import { db } from '../../../../lib/mysql';
import { sendDirectEmail, createDraftEmail } from '../../../../lib/gmail';
import { calculateBookingPrice } from '../../../../lib/pricing';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { uuid, mode } = req.body;

  console.log(`\n========================================`);
  console.log(`[PASO 1] Iniciando trigger de pago...`);
  console.log(`UUID recibido:`, uuid, `| Modo:`, mode);

  try {
    console.log(`[PASO 2] Buscando datos en la BD...`);
    const [rows] = await db.promise().query(`
      SELECT 
        bp.client_name, 
        bp.client_email, 
        bp.destination_name, 
        bp.pax_adults, 
        bsd.tour_type as tour_option, 
        bsd.* 
      FROM bookings_pipeline bp
      LEFT JOIN booking_security_details bsd ON bp.booking_uuid = bsd.booking_uuid
      WHERE bp.booking_uuid = ?
    `, [uuid]);

    if (rows.length === 0) {
      console.log(`❌ ERROR: No se encontró la reserva con UUID:`, uuid);
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    
    const booking = rows[0];
    console.log(`[PASO 3] Reserva encontrada para:`, booking.client_name, `| Destino:`, booking.destination_name);
    console.log(`Datos de tour_option leídos:`, booking.tour_option, `| Pax:`, booking.pax_adults);

    console.log(`[PASO 4] Calculando precios en pricing.js...`);
    const pricing = calculateBookingPrice(booking);
    console.log(`Precios calculados:`, pricing);

    console.log(`[PASO 5] Armando HTML del correo...`);

    const subject = `Payment Details for your Jewish Tour in ${booking.destination_name}`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2c3e50;">Jewish Tours - Payment Details</h2>
        <p>Dear ${booking.client_name},</p>
        <p>Great news! Your security profile has been approved by the local community in ${booking.destination_name}. We are ready to proceed with your booking.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ddd;">
          <h3 style="margin-top: 0; color: #2980b9;">Booking Summary</h3>
          <p><b>Tour Option:</b> ${booking.tour_option}</p>
          <p><b>Passengers:</b> ${pricing.pax}</p>
          <hr style="border: 0; border-top: 1px solid #ccc;" />
          <p><b>Base Tour Cost:</b> $${pricing.baseTotal} USD</p>
          ${pricing.extrasTotal > 0 ? `<p><b>Extra Services Requested:</b> $${pricing.extrasTotal} USD</p>` : ''}
          <h3 style="margin-bottom: 0; color: #27ae60;">Total to Pay: $${pricing.finalTotal} USD</h3>
        </div>

        <p>To confirm your reservation and secure your guide, please complete your payment using our secure link below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="LINK_DE_PAYPAL_O_STRIPE_AQUI" style="background-color: #27ae60; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            💳 Proceed to Payment
          </a>
        </div>

        <p>If you have any questions or need to adjust your itinerary, please reply to this email.</p>
        <p>Best regards,<br><b>Judaic Tourism Operations</b></p>
      </div>
    `;

    console.log(`[PASO 6] Conectando con Gmail API...`);

    let draftId = null;
    if (mode === 'direct') {
      await sendDirectEmail(booking.client_email, subject, htmlBody);
      console.log(`✅ Correo de cobro enviado directamente a ${booking.client_email}`);
    } else {
      draftId = await createDraftEmail(booking.client_email, subject, htmlBody);
      console.log(`✅ Borrador de cobro creado en Gmail para ${booking.client_email}`);
    }

    console.log(`[PASO 7] Actualizando estado de la reserva en BD...`);
    
    let updateQuery = `UPDATE bookings_pipeline SET status = 'PENDING_DEPOSIT'`;
    let updateParams = [];
    
    // Si creaste un borrador, guardamos el ID para que puedas abrirlo con un clic desde el panel
    if (draftId && mode === 'draft') {
      updateQuery += `, gmail_draft_id = ?`;
      updateParams.push(draftId);
    }
    
    updateQuery += ` WHERE booking_uuid = ?`;
    updateParams.push(uuid);

    await db.promise().query(updateQuery, updateParams);
    console.log(`[PASO 8] Proceso finalizado exitosamente.`);
    console.log(`========================================\n`);

    res.status(200).json({ success: true, draftId });

  } catch (error) {
    console.error('🔥 Error generando el pago:', error);

    console.error(`\n🔥🔥🔥 ERROR CRÍTICO EN EL SERVIDOR 🔥🔥🔥`);
    console.error(`Mensaje:`, error.message);
    console.error(`Stack trace:`, error.stack);
    console.log(`========================================\n`);
    res.status(500).json({ error: 'Error interno del servidor al procesar el pago' });
  }
}