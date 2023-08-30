import { isNumeric } from 'helpers'
import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    let sqlQuery = 'SELECT * FROM categorias'
    const { query } = req

    if (query.reduced == 1 && query.active == 1) {
      sqlQuery = 'SELECT codigo, nombre, padre FROM categorias WHERE estado=1'
    }

    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM categorias', (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar categorías' })
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
      if (!isNumeric(value)) return `"${value}"` // Agrega comillas a los valores que son strings
      return value
    })

    if (!body.nombre || !body.nombre_en || !body.padre || !body.estado) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' })
    }

    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO categorias (${keys.join(',')})
        VALUES (${values.join(',')})`,
        (err, data) => {
          if (err) {
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error al crear categoría' })
            return resolve()
          }
          res.status(200).json({
            message: `Categoría "${req.body.nombre}" agregada correctamente`,
            data: data,
          })
          return resolve()
        }
      )
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
