import formidable from 'formidable';
import crypto from 'crypto';
import { db } from '../../../../lib/mysql'
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { sendEmailWithAttachment } from '../../../../lib/gmail';
import { escapeHtml, refFooter } from '../../../../lib/html';
import { POLICIES, normalizePolicy, statusAfterTripForm } from '../../../../lib/securityPolicy';

export const config = {
  api: {
    bodyParser: false,
  },
};

// formidable v3 devuelve todos los campos como arrays
const getString = (val) => (Array.isArray(val) ? val[0] : val) || '';
const isChecked = (val) => getString(val) === 'on' || getString(val) === 'true' ? 1 : 0;

// pdfkit solo puede incrustar JPG y PNG. El resto (PDF, HEIC, etc.) va como adjunto aparte.
const EMBEDDABLE = ['image/jpeg', 'image/jpg', 'image/png'];

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const DEFAULT_GUIDE_EMAIL = process.env.SECURITY_FALLBACK_EMAIL || 'lucasschlez@gmail.com';

const toList = (files) => {
  const f = files.passport_files;
  return Array.isArray(f) ? f : f ? [f] : [];
};

const generateSecurityPDF = (data, embeddable, attachedNames) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(14).text('REQUIREMENT FOR FOREIGN - VISITORS TO THE JEWISH COMMUNITY', { align: 'center' });
    doc.moveDown(2);

    doc.font('Helvetica').fontSize(11);
    const addField = (label, value) => {
      doc.font('Helvetica-Bold').text(`${label}: `, { continued: true }).font('Helvetica').text(value || 'N/A');
      doc.moveDown(0.5);
    };

    addField('Full Name', data.passengers_names);
    addField('Ages', data.passengers_ages);
    addField('N° passport', data.passengers_passports);
    addField('Cruise ship or flight?', data.travel_type);
    addField('Date of arrival', data.arrival_date);
    addField('Date of departure', data.departure_date);
    addField('Place of residence during stay', data.hotel_name);
    addField('Phone number', data.phone_number);
    addField('Profession', data.profession);
    addField('Home address', data.home_address);
    addField('Name of the community you belong', data.community_name);
    addField('Denomination', data.religious_denomination);
    addField('Name of Rabbi or referent', data.rabbi_name);
    addField('Reason for visit', data.visit_reason);
    addField('Knows somebody from the community?', data.knows_someone ? 'Yes' : 'No');
    addField('Other Institutions you will visit', data.other_institutions);

    doc.moveDown(2);

    doc.font('Helvetica-Bold').fontSize(14).text('PASSPORT COPIES', { align: 'center' });
    doc.moveDown(1);

    if (attachedNames.length > 0) {
      doc.font('Helvetica').fontSize(11).text(`Attached separately to this email: ${attachedNames.join(', ')}`);
    }

    embeddable.forEach((file) => {
      try {
        doc.addPage();
        doc.image(file.filepath, {
          fit: [500, 700],
          align: 'center',
          valign: 'center'
        });
      } catch (e) {
        console.error("Error agregando imagen al PDF:", e);
      }
    });

    doc.end();
  });
};

const removeTempFiles = async (files) => {
  await Promise.all(toList(files).map((f) => fs.promises.unlink(f.filepath).catch(() => {})));
};

// GUIDE_VETTED: PDF con el perfil + pasaportes y mail al guía con los links de aprobar / rechazar (con token)
const sendToGuide = async ({ booking_uuid, data, files, guideEmail, securityToken }) => {
  // Los pasaportes que no se pueden incrustar en el PDF van como adjunto aparte
  const passportFiles = toList(files);
  const embeddable = passportFiles.filter((f) => EMBEDDABLE.includes(f.mimetype));
  const others = passportFiles.filter((f) => !EMBEDDABLE.includes(f.mimetype));
  const extraAttachments = await Promise.all(others.map(async (f) => ({
    filename: f.originalFilename || 'passport',
    mimeType: f.mimetype || 'application/octet-stream',
    content: await fs.promises.readFile(f.filepath),
  })));

  const pdfBuffer = await generateSecurityPDF(data, embeddable, extraAttachments.map((a) => a.filename));

  const safeNames = escapeHtml(data.passengers_names);
  const subject = `Security Clearance Required - ${data.passengers_names}`;
  const fileName = `Security_Profile_${booking_uuid.substring(0, 8)}.pdf`;

  const decisionLink = (action) =>
    `${BASE_URL}/api/security/${action}?id=${encodeURIComponent(booking_uuid)}&token=${securityToken}`;

  const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2c3e50;">Security Clearance Profile</h2>
        <p>Hello,</p>
        <p>Please find attached the security profile and passport copies for <b>${safeNames}</b>.</p>
        <p>Please forward this document to the community security department. Once they give you the green light, click the corresponding button below:</p>

        <div style="margin: 30px 0; text-align: center;">
          <a href="${decisionLink('approve')}" style="background-color: #27ae60; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; margin-right: 15px;">
            ✅ APPROVE SECURITY
          </a>
          <a href="${decisionLink('reject')}" style="background-color: #e74c3c; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            ❌ REJECT / MISSING DATA
          </a>
        </div>
        <p>Thank you,<br><b>Judaic Tourism Operations</b></p>
        ${refFooter(booking_uuid)}
      </div>
    `;

  await sendEmailWithAttachment(guideEmail, subject, htmlBody, pdfBuffer, fileName, extraAttachments);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = formidable({ multiples: true, keepExtensions: true });

  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    console.error('Error parseando el formulario:', err);
    return res.status(500).json({ error: 'Error procesando los archivos.' });
  }

  try {
    const booking_uuid = getString(fields.booking_uuid).trim();

    // 0. La reserva tiene que existir y estar esperando este formulario
    const [bookings] = await db.promise().query(
      `SELECT bp.status, bp.destination_name, bp.security_policy_applied, dc.contact_security_email
         FROM bookings_pipeline bp
         LEFT JOIN destinations_config dc ON dc.destination_name = bp.destination_name
        WHERE bp.booking_uuid = ?`,
      [booking_uuid]
    );
    if (!booking_uuid || bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    if (bookings[0].status !== 'PENDING_SECURITY_VETTING') {
      return res.status(409).json({ error: 'This form was already submitted.' });
    }

    const data = {
      passengers_names: getString(fields.passengers_names),
      passengers_ages: getString(fields.passengers_ages),
      passengers_passports: getString(fields.passengers_passports),
      travel_type: getString(fields.travel_type),
      arrival_date: getString(fields.arrival_date) || null,
      departure_date: getString(fields.departure_date) || null,
      hotel_name: getString(fields.hotel_name),
      phone_number: getString(fields.phone_number),
      profession: getString(fields.profession),
      home_address: getString(fields.home_address),
      community_name: getString(fields.community_name),
      religious_denomination: getString(fields.religious_denomination),
      rabbi_name: getString(fields.rabbi_name),
      visit_reason: getString(fields.visit_reason),
      knows_someone: isChecked(fields.knows_someone),
      other_institutions: getString(fields.other_institutions),
      tour_type: getString(fields.tour_type),
      start_time: getString(fields.start_time),
      dropoff_location: getString(fields.dropoff_location),
      difficulty_walking: isChecked(fields.difficulty_walking),
      // Nombres del formulario (extra_<id>) -> columnas de la base / lib/pricing.js
      extra_amia: isChecked(fields.extra_amia),
      extra_airport: isChecked(fields.extra_airport_transfer),
      extra_port: isChecked(fields.extra_port_transfer),
      extra_casapueblo: isChecked(fields.extra_casapueblo),
      extra_callao: isChecked(fields.extra_callao_port),
      extra_kosher_food: isChecked(fields.extra_kosher_food),
    };

    // 1. Guardamos todo en la tabla de seguridad (si había un envío previo, se reemplaza)
    await db.promise().query(`DELETE FROM booking_security_details WHERE booking_uuid = ?`, [booking_uuid]);
    const columns = Object.keys(data);
    await db.promise().query(
      `INSERT INTO booking_security_details (booking_uuid, ${columns.join(', ')}) VALUES (?, ${columns.map(() => '?').join(', ')})`,
      [booking_uuid, ...columns.map((c) => data[c])]
    );

    // 2. Camino según la política del destino
    //    GUIDE_VETTED  -> mail al guía (PDF + links con token) y queda en SECURITY_DOCS_RECEIVED
    //    EXTERNAL_FORM -> sin mail: queda en SECURITY_DOCS_RECEIVED hasta que el empleado marque la decisión de la comunidad
    //    NONE          -> sin control: pasa directo a SECURITY_APPROVED (lista para cobrar)
    const policy = normalizePolicy(bookings[0].security_policy_applied);
    let securityToken = null;
    if (policy === POLICIES.GUIDE_VETTED) {
      securityToken = crypto.randomBytes(24).toString('hex');
      await sendToGuide({
        booking_uuid, data, files, securityToken,
        guideEmail: bookings[0].contact_security_email || DEFAULT_GUIDE_EMAIL,
      });
    }

    // 3. Recién con el mail enviado (si correspondía) actualizamos la reserva.
    //    (Si Gmail falla, la reserva sigue esperando el formulario y el cliente puede reenviarlo.)
    await db.promise().query(
      `UPDATE bookings_pipeline
          SET status = ?,
              tour_option = ?,
              start_time = ?,
              pick_up_hotel = ?,
              drop_off_hotel = ?,
              walking_difficulties = ?,
              security_token = ?
        WHERE booking_uuid = ?`,
      [statusAfterTripForm(policy), data.tour_type, data.start_time, data.hotel_name, data.dropoff_location,
       data.difficulty_walking === 1 ? 'Yes' : 'No', securityToken, booking_uuid]
    );

    return res.status(200).json({ message: 'Datos completos recibidos correctamente', policy });

  } catch (error) {
    console.error('Error procesando el formulario de seguridad:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  } finally {
    // Los pasaportes no se guardan en el servidor: se borran los temporales siempre
    await removeTempFiles(files);
  }
}
