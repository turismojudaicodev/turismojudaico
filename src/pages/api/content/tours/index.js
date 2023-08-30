import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = Object.entries(req.query)

    let queryParams = ''

    if (params.length > 0) {
      params.forEach(([field, value]) => {
        queryParams += `AND ${field}=${value}`
      })
    }

    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM paquetes WHERE estado=1 ${queryParams}`,
        (err, data) => {
          if (err) {
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error al cargar tours' })
            return resolve()
          }
          res.status(200).json({ data })
          return resolve()
        }
      )
    })
  } else if (req.method === 'POST') {
    const { body } = req
    return new Promise((resolve, reject) => {
      res
        .status(201)
        .json({ message: 'Implementar post method para los tours', data: body })
      return resolve()
    })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
