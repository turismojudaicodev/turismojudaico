import { transporter, mailOptions } from 'lib/nodemailer'

function generateEmailContent(data) {
  const stringData = Object.entries(data).reduce(
    (str, [key, val]) => (str += `${key}: \n${val}\n\n`),
    ''
  )

  const htmlData = `
  <div>
    <div style="border: 1px solid #888; padding: .5rem 1rem; margin-bottom: .5rem;">
      <h2 style="text-transform: capitalize;">Nombre Completo:</h2>
      <p>${data.fullName || 'No especificado'}</p>
    </div>
    <div style="border: 1px solid #888; padding: .5rem 1rem; margin-bottom: .5rem;">
      <h2 style="text-transform: capitalize;">Pasajeros:</h2>
      <p>${data.passengers || 'No especificado'}</p>
    </div>
    <div style="border: 1px solid #888; padding: .5rem 1rem; margin-bottom: .5rem;">
      <h2 style="text-transform: capitalize;">Email:</h2>
      <p>${data.email || 'No especificado'}</p>
    </div>
    <div style="border: 1px solid #888; padding: .5rem 1rem; margin-bottom: .5rem;">
      <h2 style="text-transform: capitalize;">Teléfono:</h2>
      <p>${data.telephone || 'No especificado'}</p>
    </div>
      <div style="border: 1px solid #888; padding: .5rem 1rem; margin-bottom: .5rem;">
      <h2 style="text-transform: capitalize;">Fecha deseada:</h2>
      <p>${data.desiredDate || 'No especificado'}</p>
    </div>
    <div style="border: 1px solid #888; padding: .5rem 1rem; margin-bottom: .5rem;">
      <h2 style="text-transform: capitalize;">Mensaje:</h2>
      <p>${data.message || 'No especificado'}</p>
    </div>
  <div>
  `

  return {
    text: stringData,
    html: htmlData,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(403).json({ error: 'Method not allowed' })

  const data = req.body

  console.log('data', data)

  if (
    !data.fullName ||
    !data.email ||
    !data.passengers ||
    !data.telephone ||
    !data.desiredDate
  )
    return res.status(400).json({ error: 'Faltan cargar datos obligatorios' })

  try {
    await transporter.sendMail({
      ...mailOptions,
      ...generateEmailContent(data),
      subject: `Reserva de ${data.fullName}: ${data.email}`,
    })
    return res.status(200).json({ message: 'Reserva enviada exitosamente' })
  } catch (error) {
    console.log('Error al enviar el mail', error)
    return res.status(500).json({ error: error.message })
  }
}
