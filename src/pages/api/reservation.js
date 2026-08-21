import { db } from '../../../lib/mysql'
import { sendDirectEmail, createDraftEmail } from '../../../lib/gmail' // <-- Cambiamos nodemailer por gmail
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(403).json({ error: 'Method not allowed' })

  const data = req.body

  if (!data.citytour_nombre)
    return res.status(500).json({ error: 'No se pudo obtener el nombre del tour' })

  if (
    !data.contacto_nombre ||
    !data.contacto_mail ||
    !data.contacto_pasajeros ||
    !data.contacto_telefono ||
    !data.contacto_fecha
  )
    return res.status(400).json({ error: 'Faltan cargar datos obligatorios' })

  const query = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => err ? reject(err) : resolve(results))
  })

  try {

    const destination = data.citytour_nombre
    const fullName = data.contacto_nombre
    /* ... (resto de tus variables) ... */
    const uuid = crypto.randomUUID()

    // 🟢 NUEVA LÍNEA: Si el destino no existe en config, lo creamos automáticamente
    await query(
      'INSERT IGNORE INTO destinations_config (destination_name, security_policy_type) VALUES (?, ?)',
      [destination, 'GUIDE_VETTED']
    )

    // 3. Buscar política de seguridad en MySQL para este destino
    const destConfig = await query(
      'SELECT security_policy_type, external_form_url FROM destinations_config WHERE destination_name = ?',
      [destination]
    )
    const email = data.contacto_mail
    const telephone = data.contacto_telefono
    const hometown = data.contacto_ciudad_origen || ''
    const passengers = parseInt(data.contacto_pasajeros) || 1
    const desiredDate = data.contacto_fecha
    const message = data.contacto_mensaje || ''

    const policy = destConfig.length > 0 ? destConfig[0].security_policy_type : 'GUIDE_VETTED'

    // Guardar en la NUEVA tabla
    await query(`
      INSERT INTO bookings_pipeline 
      (booking_uuid, client_name, hometown, pax_adults, client_email, client_phone, tour_date, walking_difficulties, destination_name, security_policy_applied, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INQUIRY_RECEIVED')
    `, [uuid, fullName, hometown, passengers, email, telephone, desiredDate, message, destination, policy])

    // Guardar en la VIEJA tabla (Mantenemos tu panel actual)
    const keys = Object.keys(data)
    const values = Object.values(data)
    const queryString = `INSERT INTO reservas (${keys.join(',')}) VALUES (${new Array(values.length).fill('?').join(',')})`
    await query(queryString, values)

    // ====================================================================
    // CONSTRUCCIÓN DE LA PLANTILLA
    // ====================================================================
    const introHtml = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <p>Thank you for getting in contact with Judaic Tourism! <br>
        <i>(Sorry for the long email, but has lot of information about your request)</i></p>
        
        <p>We take the opportunity to introduce about us:<br>
        <b>JUDAIC TOURISM</b> is a social company, which offers cultural and educational services for Jewish travelers...</p>
        
        <p>We need to check with our team of guides to see if we still have availability for the requested day: <b>${desiredDate}</b>. In the meantime, I'm sending all the details and prices, so you can confirm your interest.</p>
    `;

    let cityHtml = '';
    const destLower = destination.toLowerCase();

    if (destLower.includes('buenos aires')) {
        cityHtml = `<h3>Here is all the information about the Jewish Tour in Buenos Aires</h3><p>We offer different options in Buenos Aires...</p>`;
    } else if (destLower.includes('panama') || destLower.includes('panamá')) {
        cityHtml = `<h3>Here is all the information about the Jewish Tour in Panama</h3><p>Please complete their security form at this link: <a href="https://visitors.centraldsi.com/">https://visitors.centraldsi.com/</a></p>`;
    } else {
        cityHtml = `<h3>Here is all the information about the Jewish Tour in ${destination}</h3><p>Our local coordinator is checking the best options for your group.</p>`;
    }

    let securityHtml = '';
    if (!destLower.includes('panama') && !destLower.includes('panamá')) {
      securityHtml = `<p>Please complete the security form and send your passports via WhatsApp.</p>`;
    }

    const footerHtml = `
        <p>We await your answer to book the day of the guide.</p>
        <p>Best regards,<br><br><b>Melina</b><br>on behalf of Judaic Tourism Team<br>info@turismojudaico.com</p>
      </div>
    `;

    const finalHtml = introHtml + cityHtml + securityHtml + footerHtml;

    // ====================================================================
    // LÓGICA DE ENVÍO: DRAFT vs DIRECTO (USANDO GMAIL API)
    // ====================================================================
    const mailSubject = `${destination} City Tour ${desiredDate}`;
    const hasMessage = message && message.trim().length > 0;

    if (hasMessage) {
      // 🟡 DRAFT REAL EN GMAIL: El "To:" ya es el cliente, se guarda en "Borradores" de info@turismojudaico.com
      const draftContent = `
        <div style="background-color: #fff3cd; padding: 15px; border-left: 5px solid #ffc107; margin-bottom: 20px; font-family: Arial, sans-serif;">
          <h4 style="margin-top: 0; color: #d39e00;">⚠️ EL PASAJERO ESCRIBIÓ ESTA DUDA:</h4>
          <p style="font-size: 16px;"><i>"${message}"</i></p>
          <hr style="border: 1px solid #ffeeba;">
          <p style="margin-bottom: 0; font-size: 12px; color: #856404;">
            👉 <b>Instrucción:</b> Responde su duda, borra este recuadro amarillo y dale a enviar.
          </p>
        </div>
        ${finalHtml}
      `;
      
      await createDraftEmail(email, mailSubject, draftContent);
      return res.status(200).json({ message: 'Reserva guardada. Se generó un Borrador Real en Gmail.' });
      
    } else {
      // 🟢 ENVÍO DIRECTO: Sale automático de info@turismojudaico.com
      const bcc = 'turismojudaicodev@gmail.com'; 
      await sendDirectEmail(email, mailSubject, finalHtml, bcc);
      return res.status(200).json({ message: 'Reserva guardada y correo enviado automáticamente.' });
    }

  } catch (error) {
    console.error('Error procesando reserva:', error)
    return res.status(500).json({ error: error.message })
  }
}