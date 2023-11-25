import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM proveedores', (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage || 'Error al cargar proveedores' })
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

    const queryString = `INSERT INTO proveedores (${keys.join(',')})
    VALUES (${new Array(values.length).fill('?').join(',')})`

    return new Promise((resolve, reject) => {
      db.query(queryString, values, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al agregar proveedor' })
          return resolve()
        }
        res.status(201).json({
          data,
          message: `Proveedor "${body?.nombre}" agregado correctamente`,
        })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
