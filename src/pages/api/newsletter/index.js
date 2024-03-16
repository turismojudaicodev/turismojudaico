import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = req.query

    let queryParams = []
    let limit = ''

    if (params.limit && params.offset) {
      limit = `LIMIT ${params.offset}, ${params.limit}`
    }
    if (params.estado) {
      queryParams.push(`estado=${params.estado}`)
    }

    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM newsletter ORDER BY codigo DESC LIMIT ?, ?',
        [Number(params.offset) || 0, Number(params.limit) || 5],
        (err, data) => {
          if (err) {
            console.log(err)
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error del servidor' })
            return resolve()
          }
          res.status(200).json({ data })
          return resolve()
        }
      )
    })
  } else if (req.method === 'POST') {
    const body = JSON.parse(req.body)

    if (!body.nombre || !body.mail)
      return res.status(400).json({ error: 'Falta nombre o email' })

    const queryString =
      'INSERT INTO newsletter (nombre, mail, estado) VALUES (?, ?, 1)'

    const fullName = `${body.nombre}${body.apellido ? ` ${body.apellido}` : ''}`

    return new Promise((resolve, reject) => {
      db.query(queryString, [fullName, body.mail], (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error del servidor' })
          return resolve()
        }
        res.status(201).json({
          data,
          message: 'Gracias por suscribirte a nuestra newsletter',
        })
        return resolve()
      })
    })
  } else {
    return res.status(403).json({ error: 'Method not allowed' })
  }
}
