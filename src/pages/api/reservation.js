import { transporter, mailOptions } from 'lib/nodemailer'
import { db } from 'lib/mysql'

function generateEmailContent(data) {
  const stringData = Object.entries(data).reduce(
    (str, [key, val]) => (str += `${key}: \n${val}\n\n`),
    ''
  )

  const htmlData = `
  <div>
    <div>
      <h2 style="text-transform: capitalize;">Tour:</h2>
      <p>${data.citytour_nombre || 'No especificado'}</p>
    </div>
    <div>
      <h2 style="text-transform: capitalize;">Nombre Completo:</h2>
      <p>${data.contacto_nombre || 'No especificado'}</p>
    </div>
    <div>
      <h2 style="text-transform: capitalize;">Pasajeros:</h2>
      <p>${data.contacto_pasajeros || 'No especificado'}</p>
    </div>
    <div>
      <h2 style="text-transform: capitalize;">Email:</h2>
      <p>${data.contacto_mail || 'No especificado'}</p>
    </div>
    <div>
      <h2 style="text-transform: capitalize;">Teléfono:</h2>
      <p>${data.contacto_telefono || 'No especificado'}</p>
    </div>
    <div>
      <h2 style="text-transform: capitalize;">Fecha deseada:</h2>
      <p>${data.contacto_fecha || 'No especificado'}</p>
    </div>
    <div>
      <h2 style="text-transform: capitalize;">Mensaje:</h2>
      <p>${data.contacto_mensaje || 'No especificado'}</p>
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

  if (!data.citytour_nombre)
    return res
      .status(500)
      .json({ error: 'No se pudo obtener el nombre del tour' })

  if (
    !data.contacto_nombre ||
    !data.contacto_mail ||
    !data.contacto_pasajeros ||
    !data.contacto_telefono ||
    !data.contacto_fecha
  )
    return res.status(400).json({ error: 'Faltan cargar datos obligatorios' })

  try {
    await transporter.sendMail({
      ...mailOptions,
      ...generateEmailContent(data),
      subject: `Reserva de ${data.contacto_nombre}: ${data.contacto_mail}`,
    })

    const keys = Object.keys(data)
    const values = Object.values(data)

    const queryString = `INSERT INTO reservas (${keys.join(',')})
    VALUES (${new Array(values.length).fill('?').join(',')})`

    return new Promise((resolve, reject) => {
      db.query(queryString, values, (err, data) => {
        if (err) {
          console.error('Error al guardar reserva en base de datos')
        }
        res.status(200).json({ message: 'Reserva enviada exitosamente' })
        return resolve()
      })
    })
  } catch (error) {
    console.log('Error al enviar el mail', error)
    return res.status(500).json({ error: error.message })
  }
}
