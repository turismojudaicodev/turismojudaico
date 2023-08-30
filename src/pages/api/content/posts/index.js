import { db } from 'lib/mysql'
import { isNumeric } from 'helpers'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM contenidos', (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar posts' })
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
        `INSERT INTO contenidos (${keys.join(',')})
        VALUES (${values.join(',')})`,
        (err, data) => {
          if (err) {
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error al crear post' })
            return resolve()
          }
          res.status(201).json({
            data,
            message: `Post "${body?.nombre}" creado correctamente`,
          })
          return resolve()
        }
      )
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
