import formidable from 'formidable';
import { db } from '../../../../lib/mysql'
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { sendEmailWithAttachment } from '../../../../lib/gmail';

export const config = {
  api: {
    bodyParser: false,
  },
};

const getString = (val) => (Array.isArray(val) ? val[0] : val) || '';

const generateSecurityPDF = (data, files) => {
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

    const passportFiles = Array.isArray(files.passport_files) ? files.passport_files : (files.passport_files ? [files.passport_files] : []);

    passportFiles.forEach((file) => {
      try {
        if (file.mimetype && file.mimetype.startsWith('image/')) {
          doc.addPage();
          doc.image(file.filepath, {
            fit: [500, 700],
            align: 'center',
            valign: 'center'
          });
        }
      } catch (e) {
        console.error("Error agregando imagen al PDF:", e);
      }
    });

    doc.end();
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = formidable({ multiples: true, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parseando el formulario:', err);
      return res.status(500).json({ error: 'Error procesando los archivos.' });
    }

    const booking_uuid = getString(fields.booking_uuid);
    const passengers_names = getString(fields.passengers_names);
    const passengers_ages = getString(fields.passengers_ages);
    const passengers_passports = getString(fields.passengers_passports);
    const travel_type = getString(fields.travel_type);
    const arrival_date = getString(fields.arrival_date);
    const departure_date = getString(fields.departure_date);
    const hotel_name = getString(fields.hotel_name);
    
    const phone_number = getString(fields.phone_number);
    const profession = getString(fields.profession);
    const home_address = getString(fields.home_address);
    const visit_reason = getString(fields.visit_reason);
    const other_institutions = getString(fields.other_institutions);
    const knows_someone = fields.knows_someone === 'on' || fields.knows_someone === 'true' ? 1 : 0;
    
    const community_name = getString(fields.community_name);
    const religious_denomination = getString(fields.religious_denomination);
    const rabbi_name = getString(fields.rabbi_name);

    const tour_type = getString(fields.tour_type);
    const start_time = getString(fields.start_time);
    const dropoff_location = getString(fields.dropoff_location);
    const difficulty_walking = fields.difficulty_walking === 'on' ? 1 : 0;
    
    const extra_amia = fields.extra_amia === 'on' ? 1 : 0;
    const extra_airport = fields.extra_airport_transfer === 'on' ? 1 : 0;
    
    try {
      // 1. Guardamos todo en la tabla de seguridad (¡Ahora con 23 signos de interrogación!)
      const sqlSecurity = `
        INSERT INTO booking_security_details 
        (booking_uuid, passengers_names, passengers_ages, passengers_passports, travel_type, arrival_date, departure_date, hotel_name, phone_number, profession, home_address, community_name, religious_denomination, rabbi_name, visit_reason, knows_someone, other_institutions, tour_type, start_time, dropoff_location, difficulty_walking, extra_amia, extra_airport)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const valuesSecurity = [
        booking_uuid, passengers_names, passengers_ages, passengers_passports, 
        travel_type, arrival_date, departure_date, hotel_name, 
        phone_number, profession, home_address, 
        community_name, religious_denomination, rabbi_name,
        visit_reason, knows_someone, other_institutions, tour_type,
        start_time, dropoff_location, difficulty_walking, extra_amia, extra_airport
      ];

      await db.promise().query(sqlSecurity, valuesSecurity);
      console.log(`✅ Datos de seguridad guardados.`);

      const sqlPipeline = `
        UPDATE bookings_pipeline 
        SET status = 'SECURITY_DOCS_RECEIVED', 
            tour_option = ?, 
            start_time = ?, 
            pick_up_hotel = ?, 
            drop_off_hotel = ?, 
            walking_difficulties = ?
        WHERE booking_uuid = ?
      `;
      
      const valuesPipeline = [
        tour_type, start_time, hotel_name, dropoff_location, 
        difficulty_walking === 1 ? 'Yes' : 'No', booking_uuid
      ];

      await db.promise().query(sqlPipeline, valuesPipeline);
      console.log(`✅ CRM actualizado con logística.`);
      console.log('Generando PDF...');
      const formDataForPDF = {
        passengers_names, passengers_ages, passengers_passports, travel_type, 
        arrival_date, departure_date, hotel_name, phone_number, profession, 
        home_address, community_name, religious_denomination, rabbi_name, 
        visit_reason, knows_someone, other_institutions,tour_type,
        start_time, dropoff_location, difficulty_walking, extra_amia, extra_airport
      };
      
      const pdfBuffer = await generateSecurityPDF(formDataForPDF, files);
      console.log('✅ PDF generado con éxito, tamaño:', pdfBuffer.length, 'bytes');

      console.log('Enviando correo al guía...');
      
      const guideEmail = "lucasschlez@gmail.com"; // <-- ¡OJO AQUÍ! (Ver mi pregunta abajo)
      const subject = `Security Clearance Required - ${passengers_names}`;
      const fileName = `Security_Profile_${booking_uuid.substring(0, 8)}.pdf`;

      // Los enlaces mágicos que moverán la tarjeta con un solo clic
      const approveLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/security/approve?id=${booking_uuid}`;
      const rejectLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/security/reject?id=${booking_uuid}`;

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2c3e50;">Security Clearance Profile</h2>
          <p>Hello,</p>
          <p>Please find attached the security profile and passport copies for <b>${passengers_names}</b>.</p>
          <p>Please forward this document to the community security department. Once they give you the green light, click the corresponding button below:</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${approveLink}" style="background-color: #27ae60; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; margin-right: 15px;">
              ✅ APPROVE SECURITY
            </a>
            <a href="${rejectLink}" style="background-color: #e74c3c; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
              ❌ REJECT / MISSING DATA
            </a>
          </div>
          <p>Thank you,<br><b>Judaic Tourism Operations</b></p>
        </div>
      `;

      await sendEmailWithAttachment(guideEmail, subject, htmlBody, pdfBuffer, fileName);
      console.log('✅ Correo enviado con PDF y botones mágicos.');

      res.status(200).json({ message: 'Datos completos recibidos correctamente' });

    } catch (error) {
      console.error('Error guardando en la base de datos:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  });
}