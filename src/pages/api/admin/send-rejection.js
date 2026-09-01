import { sendDirectEmail } from '../../../../lib/gmail';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { email, name, destination } = req.body;

  try {
    const subject = `Update regarding your Jewish Tour in ${destination}`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Dear ${name},</p>
        <p>Thank you for your interest in our Jewish Tour in ${destination} and for submitting your information.</p>
        <p>Unfortunately, after reviewing the details with the local community's security department, we are unable to process the required authorizations for your visit at this time. As we strictly follow the protocols established by the local community, we will not be able to offer the tour on this occasion.</p>
        <p>We sincerely apologize for any inconvenience this may cause your travel plans and appreciate your understanding.</p>
        <p>Best regards,<br><b>Judaic Tourism Operations</b></p>
      </div>
    `;

    await sendDirectEmail(email, subject, htmlBody);
    
    res.status(200).json({ message: 'Rejection email sent successfully' });
  } catch (error) {
    console.error('Error enviando rechazo:', error);
    res.status(500).json({ error: 'Error sending email' });
  }
}