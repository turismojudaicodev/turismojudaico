import { db } from '../../../lib/mysql'
import { sendDirectEmail, createDraftEmail } from '../../../lib/gmail'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const data = req.body;
  
  // 1. Extracción con los nombres EXACTOS del formulario
  const fullName = data.contacto_nombre || 'Sin Nombre';
  const email = data.contacto_mail; 
  const telephone = data.contacto_telefono || '';
  const hometown = data.contacto_ciudad_origen || '';
  const passengers = data.contacto_pasajeros || 1;
  const desiredDate = data.contacto_fecha || new Date().toISOString().split('T')[0];
  const message = data.contacto_mensaje || '';
  const destination = data.citytour_nombre || 'Ciudad General';

  if (!email) {
    return res.status(400).json({ error: 'El campo email es obligatorio para procesar la reserva.' });
  }

  const uuid = crypto.randomUUID()

  const query = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => err ? reject(err) : resolve(results))
  })

  try {
    // 🧹 DEFINIMOS destLower PARA QUE FUNCIONE TODO EL CÓDIGO
    const destLower = destination.toLowerCase();

    // 2. DEFINIR POLÍTICA Y ESTADO
    let policy = 'GUIDE_VETTED';
    if (destLower.includes('panama') || destLower.includes('panamá')) {
        policy = 'EXTERNAL_FORM';
    }

    const hasMessage = message && message.trim().length > 0;
    const initialStatus = hasMessage ? 'INQUIRY_RECEIVED' : 'PENDING_SECURITY_VETTING';

    // 🛡️ 3. AUTO-REGISTRO DE DESTINOS (INSERT IGNORE)
    await query(`
      INSERT IGNORE INTO destinations_config (destination_name, security_policy_type) 
      VALUES (?, ?)
    `, [destination, policy]);

    // 💾 4. GUARDAR LA RESERVA
    await query(`
      INSERT INTO bookings_pipeline 
      (booking_uuid, client_name, hometown, pax_adults, client_email, client_phone, tour_date, walking_difficulties, destination_name, security_policy_applied, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [uuid, fullName, hometown, passengers, email, telephone, desiredDate, message, destination, policy, initialStatus])

    // 📧 5. AUTO-RESPUESTA INMEDIATA (Se envía siempre directo)
    const autoReplySubject = `Judaic Tourism - We received your inquiry for ${destination}`;
    const autoReplyHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Dear <b>${fullName}</b>,</p>
        <p>Thank you for getting in contact with Judaic Tourism! We have successfully received your inquiry for a Jewish Tour in <b>${destination}</b> on <b>${desiredDate}</b>.</p>
        <p>Our team is currently reviewing your request and checking availability with our local coordinators.</p>
        <p>We will get back to you very shortly with more details.</p>
        <p>Best regards,<br><b>Judaic Tourism Team</b></p>
      </div>
    `;
    await sendDirectEmail(email, autoReplySubject, autoReplyHtml);

    // 🏗️ 6. CONSTRUCTOR DE PLANTILLAS POR CIUDAD
    let cityHtml = '';
    let securityHtml = '';

    switch (true) {
      case destLower.includes('buenos aires'):
        cityHtml = `<h3>[MOCKUP - BUENOS AIRES] Información del tour</h3><p>Recorrido por Once, AMIA, etc.</p>`;
        securityHtml = `<p>[MOCKUP - SEGURIDAD BA] Por favor, envíanos las fotos de los pasaportes respondiendo a este correo.</p>`;
        break;

      case destLower.includes('panama') || destLower.includes('panamá'):
        cityHtml = `<h3>[MOCKUP - PANAMÁ] Información del tour</h3><p>Detalles específicos de las sinagogas de Panamá.</p>`;
        securityHtml = `<p>[MOCKUP - SEGURIDAD PANAMÁ] Por razones estrictas de seguridad, completa este formulario: <a href="https://visitors.centraldsi.com/">Link Comunidad Panamá</a></p>`;
        break;

      case destLower.includes('lima'):
        cityHtml = `<h3>[MOCKUP - LIMA] Información del tour</h3><p>Detalles del recorrido en Lima.</p>`;
        securityHtml = `<p>[MOCKUP - SEGURIDAD LIMA] Instrucciones específicas para entrar a la sinagoga 1870.</p>`;
        break;

      default:
        cityHtml = `<h3>Tour en ${destination}</h3><p>Estamos validando las opciones con nuestro equipo local.</p>`;
        securityHtml = `<p>Solicitaremos copias de los pasaportes para el ingreso a las instituciones.</p>`;
        break;
    }

    const introHtml = `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;"><p>Hello ${fullName},</p>`;
    const footerHtml = `<p>We await your confirmation!</p><p>Best regards,<br><b>Melina</b><br>Judaic Tourism</p></div>`;
    const finalHtml = introHtml + cityHtml + securityHtml + footerHtml;

    const infoSubject = `${destination} City Tour Details - ${desiredDate}`;

    // 🔀 7. BIFURCACIÓN INTELIGENTE (Borrador vs Envío Directo)
    if (hasMessage) {
        const draftId = await createDraftEmail(email, infoSubject, finalHtml);
        await query(`UPDATE bookings_pipeline SET gmail_draft_id = ? WHERE booking_uuid = ?`, [draftId, uuid]);
    } else {
        await sendDirectEmail(email, infoSubject, finalHtml);
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Server error' })
  }
}