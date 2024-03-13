import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = req.query

    let queryParams = []

    if (params.estado) {
      queryParams.push(`estado=${params.estado}`)
    }

    const queryString = `SELECT * FROM logos ${
      queryParams.length > 0 ? 'WHERE ' + queryParams.join('AND') : ''
    } ORDER BY codigo DESC`

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
        console.log(data)
        if (err) {
          console.log(err)
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error del servidor' })
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

    const queryString = `INSERT INTO logos (${keys.join(',')})
    VALUES (${new Array(values.length).fill('?').join(',')})`

    return new Promise((resolve, reject) => {
      db.query(queryString, values, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al agregar logo' })
          return resolve()
        }
        res.status(201).json({ message: 'Logo agregado exitosamente', data })
        return resolve()
      })
    })
  } else {
    return res.status(403).json({ error: 'Method not allowed' })
  }
}
