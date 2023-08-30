import { isNumeric } from 'helpers'
import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { query } = req
    let sqlQuery = 'SELECT * FROM paises'

    if (query.reduced == 1 && query.active == 1) {
      sqlQuery = 'SELECT codigo, nombre FROM paises WHERE estado=1'
    }

    return new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar países' })
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

    if (
      !body.nombre ||
      !body.nombre_en ||
      !isNumeric(body.estado) ||
      !isNumeric(body.gmt)
    )
      return res.status(400).json({ error: 'Faltan campos obligatorios' })

    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO paises (${keys.join(',')}) VALUES (${values.join(',')})`,
        (err, data) => {
          if (err) {
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error al crear país' })
            return resolve()
          }
          res
            .status(200)
            .json({ message: `${body.nombre} agregado correctamente`, data })
          return resolve()
        }
      )
    })
  } else {
    res.status(403).json({ error: 'Method not allowed ' })
  }
}
