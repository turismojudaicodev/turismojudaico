import crypto from 'crypto'
import { query } from '../../../lib/mysql'
import { sendDirectEmail, createDraftEmail, withBookingRef } from '../../../lib/gmail'
import { BOOKING_STATUS, getSecurityFormUrl } from '../../../lib/bookings'
import { escapeHtml, isValidEmail } from '../../../lib/html'

const isPanama = (destination) => /panam[aá]/i.test(destination)

/** Texto específico de cada ciudad para el mail con la info del tour (todavía son borradores). */
function getCityTemplate(destination, securityFormUrl) {
  const formLink = `<p>To continue, please complete your trip details and security information here:
    <a href="${securityFormUrl}">${securityFormUrl}</a></p>`
  const lower = destination.toLowerCase()

  if (lower.includes('buenos aires')) {
    return {
      city: '<h3>[MOCKUP - BUENOS AIRES] Información del tour</h3><p>Recorrido por Once, AMIA, etc.</p>',
      security: formLink,
    }
  }
  if (isPanama(destination)) {
    return {
      city: '<h3>[MOCKUP - PANAMÁ] Información del tour</h3><p>Detalles específicos de las sinagogas de Panamá.</p>',
      security:
        '<p>For strict security reasons, please complete this form: <a href="https://visitors.centraldsi.com/">Panama Community form</a></p>',
    }
  }
  if (lower.includes('lima')) {
    return {
      city: '<h3>[MOCKUP - LIMA] Información del tour</h3><p>Detalles del recorrido en Lima.</p>',
      security: formLink,
    }
  }
  return {
    city: `<h3>Tour in ${escapeHtml(destination)}</h3><p>We are confirming the options with our local team.</p>`,
    security: formLink,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const data = req.body
  const fullName = String(data.contacto_nombre || '').trim()
  const email = String(data.contacto_mail || '').trim()
  const telephone = data.contacto_telefono || ''
  const hometown = data.contacto_ciudad_origen || ''
  const passengers = parseInt(data.contacto_pasajeros) || 1
  const desiredDate = data.contacto_fecha
  const message = String(data.contacto_mensaje || '').trim()
  const destination = String(data.citytour_nombre || '').trim()

  if (!fullName || !destination) {
    return res.status(400).json({ error: 'Faltan el nombre o el tour.' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'El email no es válido.' })
  }
  if (!desiredDate || Number.isNaN(Date.parse(desiredDate))) {
    return res.status(400).json({ error: 'La fecha del tour no es válida.' })
  }

  const uuid = crypto.randomUUID()
  const policy = isPanama(destination) ? 'EXTERNAL_FORM' : 'GUIDE_VETTED'

  // Si el cliente escribió un mensaje, el equipo lo revisa antes de mandar la info del tour.
  const hasMessage = message.length > 0
  const initialStatus = hasMessage
    ? BOOKING_STATUS.INQUIRY_RECEIVED
    : BOOKING_STATUS.PENDING_SECURITY_VETTING

  try {
    // Registra el destino si es nuevo (la reserva tiene una foreign key a esta tabla).
    await query(
      'INSERT IGNORE INTO destinations_config (destination_name, security_policy_type) VALUES (?, ?)',
      [destination, policy]
    )

    await query(
      `INSERT INTO bookings_pipeline
        (booking_uuid, client_name, hometown, pax_adults, client_email, client_phone, tour_date,
         walking_difficulties, destination_name, security_policy_applied, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid, fullName, hometown, passengers, email, telephone, desiredDate, message, destination, policy, initialStatus]
    )

    const safeName = escapeHtml(fullName)
    const safeDestination = escapeHtml(destination)
    const safeDate = escapeHtml(desiredDate)

    // 1. Auto-respuesta inmediata
    const autoReplyHtml = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Dear <b>${safeName}</b>,</p>
        <p>Thank you for getting in contact with Judaic Tourism! We have successfully received your inquiry for a Jewish Tour in <b>${safeDestination}</b> on <b>${safeDate}</b>.</p>
        <p>Our team is currently reviewing your request and checking availability with our local coordinators.</p>
        <p>We will get back to you very shortly with more details.</p>
        <p>Best regards,<br><b>Judaic Tourism Team</b></p>
      </div>`
    await sendDirectEmail(
      email,
      `Judaic Tourism - We received your inquiry for ${destination}`,
      withBookingRef(autoReplyHtml, uuid)
    )

    // 2. Mail con la info del tour y el link al formulario de seguridad
    const template = getCityTemplate(destination, getSecurityFormUrl(uuid))
    const infoHtml = withBookingRef(
      `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <p>Hello ${safeName},</p>
        ${template.city}
        ${template.security}
        <p>We await your confirmation!</p>
        <p>Best regards,<br><b>Melina</b><br>Judaic Tourism</p>
      </div>`,
      uuid
    )
    const infoSubject = `${destination} City Tour Details - ${desiredDate}`

    if (hasMessage) {
      // Queda como borrador: se envía desde el panel al pasar la reserva a Seguridad.
      const draftId = await createDraftEmail(email, infoSubject, infoHtml)
      await query('UPDATE bookings_pipeline SET gmail_draft_id = ? WHERE booking_uuid = ?', [draftId, uuid])
    } else {
      await sendDirectEmail(email, infoSubject, infoHtml)
    }

    return res.status(200).json({ message: 'Reserva enviada exitosamente' })
  } catch (error) {
    console.error('Error procesando la reserva:', error)
    return res.status(500).json({ error: 'Error del servidor al procesar la reserva' })
  }
}
