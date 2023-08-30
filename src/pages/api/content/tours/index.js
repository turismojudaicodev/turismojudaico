import { db } from 'lib/mysql'
import { isNumeric } from 'helpers'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = Object.entries(req.query)

    let queryParams = ''

    if (params.length > 0) {
      queryParams += 'WHERE estado=1'
      params.forEach(([field, value]) => {
        queryParams += ` AND ${field}=${value}`
      })
    }

    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM paquetes ${queryParams}`, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar tours' })
          return resolve()
        }
        res.status(200).json({ data })
        return resolve()
      })
    })
  } else if (req.method === 'POST') {
    const { body } = req
    const keys = Object.keys(body)
    const values = Object.values(body).map((value) => {
      if (!isNumeric(value)) return `"${value}"`
      return value
    })

    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO paquetes (${keys.join(',')})
        VALUES (${values.join(',')})`,
        (err, data) => {
          if (err) {
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error al crear tour' })
            return resolve()
          }
          res.status(201).json({
            data,
            message: `Tour "${body?.nombre}" creado exitosamente`,
          })
          return resolve()
        }
      )
    })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
