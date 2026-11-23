import fs from 'fs/promises'
import formidable from 'formidable'
import PDFDocument from 'pdfkit'
import { query } from '../../../../lib/mysql'
import { getBaseUrl, getBookingByUuid, SECURITY_FORM_OPEN_STATUSES, BOOKING_STATUS } from '../../../../lib/bookings'
import { sendEmailWithAttachments, withBookingRef } from '../../../../lib/gmail'
import { escapeHtml } from '../../../../lib/html'

export const config = {
  api: { bodyParser: false },
}

// Extras que puede pedir el cliente. El nombre del campo en el form es `extra_<id>`
// y coincide con la columna de booking_security_details y con lib/pricing.js.
const EXTRA_FIELDS = ['extra_amia', 'extra_airport', 'extra_port', 'extra_casapueblo', 'extra_callao', 'extra_kosher_food']

// pdfkit solo puede incrustar estos formatos; el resto de los archivos se adjunta aparte.
const EMBEDDABLE_IMAGES = ['image/jpeg', 'image/png']

// formidable v3 devuelve cada campo como array.
const text = (fields, name) => {
  const value = fields[name]
  return String((Array.isArray(value) ? value[0] : value) ?? '').trim()
}
const checkbox = (fields, name) => (['on', 'true'].includes(text(fields, name)) ? 1 : 0)
const dateOrNull = (fields, name) => text(fields, name) || null

function readSecurityData(fields) {
  const data = {
    passengers_names: text(fields, 'passengers_names'),
    passengers_ages: text(fields, 'passengers_ages'),
    passengers_passports: text(fields, 'passengers_passports'),
    travel_type: text(fields, 'travel_type'),
    arrival_date: dateOrNull(fields, 'arrival_date'),
    departure_date: dateOrNull(fields, 'departure_date'),
    hotel_name: text(fields, 'hotel_name'),
    phone_number: text(fields, 'phone_number'),
    profession: text(fields, 'profession'),
    home_address: text(fields, 'home_address'),
    community_name: text(fields, 'community_name'),
    religious_denomination: text(fields, 'religious_denomination'),
    rabbi_name: text(fields, 'rabbi_name'),
    visit_reason: text(fields, 'visit_reason'),
    knows_someone: checkbox(fields, 'knows_someone'),
    other_institutions: text(fields, 'other_institutions'),
    tour_type: text(fields, 'tour_type'),
    start_time: text(fields, 'start_time'),
    dropoff_location: text(fields, 'dropoff_location'),
    difficulty_walking: checkbox(fields, 'difficulty_walking'),
  }
  for (const extra of EXTRA_FIELDS) data[extra] = checkbox(fields, extra)
  return data
}

/** Guarda los datos de seguridad. Si el cliente reenvía el formulario, reemplaza los anteriores. */
async function saveSecurityDetails(bookingUuid, data) {
  const columns = ['booking_uuid', ...Object.keys(data)]
  const values = [bookingUuid, ...Object.values(data)]

  await query('DELETE FROM booking_security_details WHERE booking_uuid = ?', [bookingUuid])
  await query(
    `INSERT INTO booking_security_details (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    values
  )
  await query(
    `UPDATE bookings_pipeline
     SET status = ?, tour_option = ?, start_time = ?, pick_up_hotel = ?, drop_off_hotel = ?, walking_difficulties = ?
     WHERE booking_uuid = ?`,
    [
      BOOKING_STATUS.SECURITY_DOCS_RECEIVED,
      data.tour_type,
      data.start_time,
      data.hotel_name,
      data.dropoff_location,
      data.difficulty_walking ? 'Yes' : 'No',
      bookingUuid,
    ]
  )
}

function generateSecurityPDF(data, imageFiles) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const buffers = []
    doc.on('data', (chunk) => buffers.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)

    doc.font('Helvetica-Bold').fontSize(14)
      .text('REQUIREMENT FOR FOREIGN - VISITORS TO THE JEWISH COMMUNITY', { align: 'center' })
    doc.moveDown(2)
    doc.fontSize(11)

    const addField = (label, value) => {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true }).font('Helvetica').text(value || 'N/A')
      doc.moveDown(0.5)
    }
    addField('Full Name', data.passengers_names)
    addField('Ages', data.passengers_ages)
    addField('N° passport', data.passengers_passports)
    addField('Cruise ship or flight?', data.travel_type)
    addField('Date of arrival', data.arrival_date)
    addField('Date of departure', data.departure_date)
    addField('Place of residence during stay', data.hotel_name)
    addField('Phone number', data.phone_number)
    addField('Profession', data.profession)
    addField('Home address', data.home_address)
    addField('Name of the community you belong', data.community_name)
    addField('Denomination', data.religious_denomination)
    addField('Name of Rabbi or referent', data.rabbi_name)
    addField('Reason for visit', data.visit_reason)
    addField('Knows somebody from the community?', data.knows_someone ? 'Yes' : 'No')
    addField('Other Institutions you will visit', data.other_institutions)

    if (imageFiles.length > 0) {
      doc.moveDown(2)
      doc.font('Helvetica-Bold').fontSize(14).text('PASSPORT COPIES', { align: 'center' })
    }
    for (const file of imageFiles) {
      try {
        doc.addPage()
        doc.image(file.filepath, { fit: [500, 700], align: 'center', valign: 'center' })
      } catch (error) {
        console.error('No se pudo agregar la imagen al PDF:', file.originalFilename, error)
      }
    }

    doc.end()
  })
}

/** Mail del responsable de seguridad del destino, o el genérico si no está configurado. */
async function getSecurityContactEmail(destinationName) {
  const [config] = await query(
    'SELECT contact_security_email FROM destinations_config WHERE destination_name = ?',
    [destinationName]
  )
  return config?.contact_security_email || process.env.SECURITY_FALLBACK_EMAIL || process.env.GMAIL_USER
}

function buildGuideEmail(booking, data) {
  const reviewUrl = (action) => `${getBaseUrl()}/api/security/${action}?id=${booking.booking_uuid}`
  const button = (color) =>
    `background-color: ${color}; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;`

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2c3e50;">Security Clearance Profile</h2>
      <p>Hello,</p>
      <p>Please find attached the security profile and passport copies for <b>${escapeHtml(data.passengers_names)}</b>
         (tour in ${escapeHtml(booking.destination_name)}).</p>
      <p>Please forward this document to the community security department. Once they answer, click the corresponding button below:</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${reviewUrl('approve')}" style="${button('#27ae60')} margin-right: 15px;">✅ APPROVE SECURITY</a>
        <a href="${reviewUrl('reject')}" style="${button('#e74c3c')}">❌ REJECT / MISSING DATA</a>
      </div>
      <p>Thank you,<br><b>Judaic Tourism Operations</b></p>
    </div>`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  let uploadedFiles = []
  try {
    const [fields, files] = await formidable({ keepExtensions: true }).parse(req)
    uploadedFiles = [files.passport_files ?? []].flat()

    const booking = await getBookingByUuid(text(fields, 'booking_uuid'))
    if (!booking) return res.status(404).json({ error: 'Booking not found.' })
    if (!SECURITY_FORM_OPEN_STATUSES.includes(booking.status)) {
      return res.status(409).json({ error: 'This booking is no longer accepting security information.' })
    }

    const data = readSecurityData(fields)
    await saveSecurityDetails(booking.booking_uuid, data)

    const images = uploadedFiles.filter((file) => EMBEDDABLE_IMAGES.includes(file.mimetype))
    const otherFiles = uploadedFiles.filter((file) => !EMBEDDABLE_IMAGES.includes(file.mimetype))

    const pdf = await generateSecurityPDF(data, images)
    const attachments = [
      {
        filename: `Security_Profile_${booking.booking_uuid.substring(0, 8)}.pdf`,
        mimeType: 'application/pdf',
        content: pdf,
      },
      ...(await Promise.all(
        otherFiles.map(async (file) => ({
          filename: file.originalFilename || 'passport',
          mimeType: file.mimetype || 'application/octet-stream',
          content: await fs.readFile(file.filepath),
        }))
      )),
    ]

    await sendEmailWithAttachments(
      await getSecurityContactEmail(booking.destination_name),
      `Security Clearance Required - ${data.passengers_names}`,
      withBookingRef(buildGuideEmail(booking, data), booking.booking_uuid),
      attachments
    )

    return res.status(200).json({ message: 'Information received successfully.' })
  } catch (error) {
    console.error('Error procesando el formulario de seguridad:', error)
    return res.status(500).json({ error: 'Internal server error.' })
  } finally {
    // Los pasaportes son datos sensibles: no dejamos copias en el disco del servidor.
    await Promise.all(uploadedFiles.map((file) => fs.unlink(file.filepath).catch(() => {})))
  }
}
