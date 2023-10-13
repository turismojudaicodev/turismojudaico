import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(403).json({ error: 'Method not allowed' })

  const body = JSON.parse(req.body)

  if (!body.nombre || !body.mail)
    return res.status(400).json({ error: 'Falta nombre o email' })

  const queryString =
    'INSERT INTO newsletter (nombre, mail, estado) VALUES (?, ?, 1)'

  const fullName = `${body.nombre}${body.apellido ? ` ${body.apellido}` : ''}`

  return new Promise((resolve, reject) => {
    db.query(queryString, [fullName, body.mail], (err, data) => {
      if (err) {
        res.status(500).json({ error: err.sqlMessage ?? 'Error del servidor' })
        return resolve()
      }
      res.status(201).json({
        data,
        message: 'Gracias por suscribirte a nuestra newsletter',
      })
      return resolve()
    })
  })
}
