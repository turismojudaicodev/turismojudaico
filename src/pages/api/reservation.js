import { db } from '../../../lib/mysql'
import { sendDirectEmail, createDraftEmail, replyInfo } from '../../../lib/gmail'
import { isValidEmail, refFooter } from '../../../lib/html'
import { getDestinationPolicy, policyForNewDestination } from '../../../lib/securityPolicy'
import { lateMail, proposalMail, receivedMail } from '../../../lib/mails/index'
import { daysUntil } from '../../../lib/mails/flags'
import { isReturningCustomer } from '../../../lib/mails/returning'
import crypto from 'crypto'

// Reservas que llegan con menos de esta anticipación van por el mail TARDE (borrador) y se marcan en el panel.
export const LATE_DAYS = 7
const todayIso = () => new Date().toISOString().slice(0, 10)

const PORTS = ['amador', 'colon', 'santos', 'rio', 'san_antonio', 'callao', 'buenos_aires', 'montevideo', 'punta_del_este', 'otro']
const oneLine = (v, max) => String(v || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max)

/** Respuestas extra del formulario (eligen los bloques de los mails). Solo valores conocidos. */
export function bookingAnswers(data) {
  const cruise = data.extra_crucero === 'si'
  return {
    cruise: cruise
      ? { port: PORTS.includes(data.extra_crucero_puerto) ? data.extra_crucero_puerto : 'otro', ship: oneLine(data.extra_crucero_barco, 100) }
      : null,
    kosher: data.extra_kosher === 'si',
    luggage: data.extra_valijas === 'si',
  }
}

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
  // Idioma de los mails: el del sitio desde el que reservó.
  const language = data.idioma === 'es' ? 'es' : 'en';
  const answers = bookingAnswers(data);

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

  const hasMessage = !!(message && message.trim().length > 0);
  const late = daysUntil(desiredDate, todayIso()) < LATE_DAYS;

  let policy, booking, mail, returning = false;
  try {
    // 🛡️ 3. AUTO-REGISTRO DE DESTINOS (INSERT IGNORE) + POLÍTICA DE SEGURIDAD DESDE LA BASE
    await query(`
      INSERT IGNORE INTO destinations_config (destination_name, security_policy_type)
      VALUES (?, ?)
    `, [destination, policyForNewDestination(destination)]);
    ({ policy } = await getDestinationPolicy(query, destination));

    // Mail que corresponde (plantillas del equipo, lib/mails):
    // - TARDE (menos de una semana): borrador, lo decide el equipo.
    // - Propuesta (rta 1): sale directo; queda en borrador si el cliente dejó un mensaje
    //   o si la plantilla no tiene la sección de la ciudad.
    try {
      returning = await isReturningCustomer(email, uuid);
    } catch (error) {
      console.error('No se pudo ver si el cliente repite (sigue como cliente nuevo):', error.code || error);
    }
    booking = {
      booking_uuid: uuid, client_name: fullName, client_email: email, client_phone: telephone, tour_date: desiredDate,
      destination_name: destination, security_policy_applied: policy, pax_adults: passengers, client_language: language,
      booking_answers_json: answers,
    };
    mail = late ? lateMail(booking) : proposalMail(booking, { returning });

    // 2. ESTADO INICIAL: si el mail queda en borrador hay que contestarle ("Por Responder")
    const asDraft = hasMessage || !!mail.review;
    const initialStatus = asDraft ? 'INQUIRY_RECEIVED' : 'PENDING_SECURITY_VETTING';
    mail.asDraft = asDraft;

    // 💾 4. GUARDAR LA RESERVA
    await query(`
      INSERT INTO bookings_pipeline
      (booking_uuid, client_name, hometown, pax_adults, client_email, client_phone, tour_date, walking_difficulties, destination_name, security_policy_applied, status, client_language, booking_answers_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [uuid, fullName, hometown, passengers, email, telephone, desiredDate, message, destination, policy, initialStatus, language, JSON.stringify(answers)])
  } catch (error) {
    console.error('Error guardando la reserva:', error)
    return res.status(500).json({ error: 'Server error' })
  }

  // A partir de acá la reserva ya está guardada: si falla Gmail no le devolvemos error al cliente
  // (la reserva aparece igual en el panel y el mail se puede reenviar desde ahí).
  try {
    // 📧 5. Con mensaje: "Recibimos su consulta" sale directo (la propuesta queda en borrador para contestarle).
    //    La propuesta / TARDE va después como respuesta en ese mismo hilo ("Re: Jewish Tour ...").
    let thread = null;
    let subject = mail.subject;
    if (hasMessage) {
      const received = receivedMail(booking);
      const sent = await sendDirectEmail(email, received.subject, received.html + refFooter(uuid));
      thread = await replyInfo(sent?.data?.id);
      subject = `Re: ${received.subject}`;
    }

    // 6. Propuesta / TARDE
    const html = mail.html + refFooter(uuid);
    if (mail.asDraft) {
      const draftId = await createDraftEmail(email, subject, html, thread);
      await query(`UPDATE bookings_pipeline SET gmail_draft_id = ? WHERE booking_uuid = ?`, [draftId, uuid]);
    } else {
      await sendDirectEmail(email, subject, html, '', thread);
    }
  } catch (error) {
    console.error(`Reserva ${uuid} guardada, pero falló el envío de mails:`, error)
  }

  return res.status(200).json({ success: true })
}
