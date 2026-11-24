import { db } from '../../../lib/mysql'
import { sendDirectEmail, createDraftEmail } from '../../../lib/gmail'
import { escapeHtml, isValidEmail, refFooter } from '../../../lib/html'
import { POLICIES, getDestinationPolicy, policyForNewDestination } from '../../../lib/securityPolicy'
import crypto from 'crypto'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const data = req.body || {};

  // 1. Extracción con los nombres EXACTOS del formulario
  const fullName = String(data.contacto_nombre || 'Sin Nombre').trim();
  const email = String(data.contacto_mail || '').trim();
  const telephone = data.contacto_telefono || '';
  const hometown = data.contacto_ciudad_origen || '';
  const passengers = parseInt(data.contacto_pasajeros) || 1;
  const desiredDate = String(data.contacto_fecha || '').trim();
  const message = data.contacto_mensaje || '';
  const destination = data.citytour_nombre || 'Ciudad General';

  if (!email) {
    return res.status(400).json({ error: 'El campo email es obligatorio para procesar la reserva.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'El email no es válido.' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(desiredDate) || isNaN(Date.parse(desiredDate))) {
    return res.status(400).json({ error: 'La fecha del tour es obligatoria (AAAA-MM-DD).' });
  }

  const uuid = crypto.randomUUID()

  const query = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => err ? reject(err) : resolve(results))
  })

  // Versiones escapadas para meter en los mails
  const safeName = escapeHtml(fullName);
  const safeDestination = escapeHtml(destination.trim());
  const safeDate = escapeHtml(desiredDate);

  const destLower = destination.toLowerCase();

  // 2. ESTADO INICIAL: con mensaje primero hay que contestarle ("Por Responder")
  const hasMessage = message && message.trim().length > 0;
  const initialStatus = hasMessage ? 'INQUIRY_RECEIVED' : 'PENDING_SECURITY_VETTING';

  let policy, externalFormUrl;
  try {
    // 🛡️ 3. AUTO-REGISTRO DE DESTINOS (INSERT IGNORE) + POLÍTICA DE SEGURIDAD DESDE LA BASE
    await query(`
      INSERT IGNORE INTO destinations_config (destination_name, security_policy_type)
      VALUES (?, ?)
    `, [destination, policyForNewDestination(destination)]);
    ({ policy, externalFormUrl } = await getDestinationPolicy(query, destination));

    // 💾 4. GUARDAR LA RESERVA
    await query(`
      INSERT INTO bookings_pipeline
      (booking_uuid, client_name, hometown, pax_adults, client_email, client_phone, tour_date, walking_difficulties, destination_name, security_policy_applied, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [uuid, fullName, hometown, passengers, email, telephone, desiredDate, message, destination, policy, initialStatus])
  } catch (error) {
    console.error('Error guardando la reserva:', error)
    return res.status(500).json({ error: 'Server error' })
  }

  // A partir de acá la reserva ya está guardada: si falla Gmail no le devolvemos error al cliente
  // (la reserva aparece igual en el panel y el mail se puede reenviar desde ahí).
  try {
    // 📧 5. AUTO-RESPUESTA INMEDIATA (Se envía siempre directo)
    const autoReplySubject = `Judaic Tourism - We received your inquiry for ${destination.trim()}`;
    const autoReplyHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Dear <b>${safeName}</b>,</p>
        <p>Thank you for getting in contact with Judaic Tourism! We have successfully received your inquiry for a Jewish Tour in <b>${safeDestination}</b> on <b>${safeDate}</b>.</p>
        <p>Our team is currently reviewing your request and checking availability with our local coordinators.</p>
        <p>We will get back to you very shortly with more details.</p>
        <p>Best regards,<br><b>Judaic Tourism Team</b></p>
        ${refFooter(uuid)}
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
        securityHtml = `<p>[MOCKUP - SEGURIDAD PANAMÁ] Por razones estrictas de seguridad, la comunidad local pide completar su propio formulario.</p>`;
        break;

      case destLower.includes('lima'):
        cityHtml = `<h3>[MOCKUP - LIMA] Información del tour</h3><p>Detalles del recorrido en Lima.</p>`;
        securityHtml = `<p>[MOCKUP - SEGURIDAD LIMA] Instrucciones específicas para entrar a la sinagoga 1870.</p>`;
        break;

      default:
        cityHtml = `<h3>Tour en ${safeDestination}</h3><p>Estamos validando las opciones con nuestro equipo local.</p>`;
        securityHtml = `<p>Solicitaremos copias de los pasaportes para el ingreso a las instituciones.</p>`;
        break;
    }

    // 🔗 Links según la política del destino:
    //    - formulario de la comunidad (EXTERNAL_FORM)
    //    - nuestro formulario de viaje, siempre (tour, horario, hotel, extras; pasaporte solo si GUIDE_VETTED)
    if (policy === POLICIES.EXTERNAL_FORM && externalFormUrl) {
      securityHtml += `
        <p><b>Step 1:</b> complete the local community's security form: <a href="${escapeHtml(externalFormUrl)}">${escapeHtml(externalFormUrl)}</a></p>`;
    }
    const securityLink = `${BASE_URL}/security/${uuid}`;
    const tripFormText = policy === POLICIES.GUIDE_VETTED
      ? 'Please complete your trip details and security information here:'
      : `${policy === POLICIES.EXTERNAL_FORM ? '<b>Step 2:</b> p' : 'P'}lease complete your trip details here:`;
    securityHtml += `
        <p>${tripFormText}</p>
        <p style="margin: 20px 0;"><a href="${securityLink}" style="background-color: #2980b9; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete my trip details</a></p>
        <p style="font-size: 12px; color: #7f8c8d;">If the button does not work, copy this link: ${securityLink}</p>`;

    const introHtml = `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;"><p>Hello ${safeName},</p>`;
    const footerHtml = `<p>We await your confirmation!</p><p>Best regards,<br><b>Melina</b><br>Judaic Tourism</p>${refFooter(uuid)}</div>`;
    const finalHtml = introHtml + cityHtml + securityHtml + footerHtml;

    const infoSubject = `${destination.trim()} City Tour Details - ${desiredDate}`;

    if (hasMessage) {
      const draftId = await createDraftEmail(email, infoSubject, finalHtml);
      await query(`UPDATE bookings_pipeline SET gmail_draft_id = ? WHERE booking_uuid = ?`, [draftId, uuid]);
    } else {
      await sendDirectEmail(email, infoSubject, finalHtml);
    }
  } catch (error) {
    console.error(`Reserva ${uuid} guardada, pero falló el envío de mails:`, error)
  }

  return res.status(200).json({ success: true })
}
