import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = req.query
    let queryParams = []
    let limit = ''

    if (params.estado) {
      queryParams.push(`estado=${params.estado}`)
    }

    const queryString = `SELECT * FROM quienessomos ${
      queryParams.length > 0 ? 'WHERE ' + queryParams.join(' AND ') : ''
    }`

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar blogs' })
          return resolve()
        }
        res.status(200).json({ data })
        return resolve()
      })
    })
  } else if (req.method === 'POST') {
    const { body } = req
    const keys = Object.keys(body)
    const values = Object.values(body)

    const queryString = `INSERT INTO quienessomos (${keys.join(',')})
    VALUES (${new Array(values.length).fill('?').join(',')})`

    return new Promise((resolve, reject) => {
      db.query(queryString, values, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({
              error: err.sqlMessage ?? 'Error al crear nueva descripción',
            })
          return resolve()
        }
        res
          .status(201)
          .json({ message: 'Descripción creada exitosamente', data })
        return resolve()
      })
    })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
