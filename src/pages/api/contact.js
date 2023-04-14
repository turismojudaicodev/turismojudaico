import { transporter, mailOptions } from 'lib/nodemailer'

function generateEmailContent(data) {
  const stringData = Object.entries(data).reduce(
    (str, [key, val]) => (str += `${key}: \n${val}\n\n`),
    ''
  )

  const htmlData = Object.entries(data).reduce(
    (str, [key, val]) =>
      (str += `
        <div style="border: 1px solid #888; padding: .5rem 1rem; margin-bottom: .5rem;">
          <h2 style="text-transform: capitalize;">${key}:</h2>
          <p>${val || 'No especificado'}</p>
        </div>
      `),
    ''
  )

  return {
    text: stringData,
    html: htmlData,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(403).json({ error: 'Method not allowed' })

  const data = req.body

  if (!data.name || !data.email || !data.message)
    return res.status(400).json({ error: 'Bad request' })

  try {
    await transporter.sendMail({
      ...mailOptions,
      ...generateEmailContent(data),
      subject: `Mensaje de ${data.name}: ${data.email}`,
    })
    return res.status(200).json({ message: 'Mail enviado exitosamente' })
  } catch (error) {
    console.log('Failed to send email', error)
    return res.status(400).json({ error: error.message })
  }
}
