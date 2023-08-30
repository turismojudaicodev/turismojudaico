import { isNumeric } from 'helpers'
import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM noticias', (err, data) => {
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
    const values = Object.values(body).map((value) => {
      if (!isNumeric(value)) return `"${value}"`
      return value
    })

    return new Promise((resolve, reject) => {
      db.query(
        `
        INSERT INTO noticias (${keys.join(',')})
        VALUES (${values.join(',')})
      `,
        (err, data) => {
          if (err) {
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error al crear blog' })
            return resolve()
          }
          res.status(201).json({ message: 'Blog creado exitosamente', data })
          return resolve()
        }
      )
    })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
