import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    let sqlQuery = 'SELECT * FROM ciudades'
    const { query } = req

    if (query.reduced == 1 && query.active == 1) {
      sqlQuery = 'SELECT codigo, nombre, pais FROM ciudades WHERE estado=1'
    }
    if (query.populate === 'pais') {
      sqlQuery = `
      SELECT c.codigo, c.nombre, c.estado, p.codigo as pais, p.nombre as nombre_pais
      FROM ciudades c INNER JOIN paises p ON c.pais = p.codigo
      `
    }

    return new Promise((resolve, reject) => {
      db.query(sqlQuery, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar ciudades' })
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

    const queryString = `INSERT INTO ciudades (${keys.join(',')})
    VALUES (${new Array(values.length).fill('?').join(',')})`

    return new Promise((resolve, reject) => {
      db.query(queryString, values, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al crear ciudad' })
        }
        return resolve()
      })
      res.status(201).json({ message: 'Ciudad creada exitosamente' })
      return resolve()
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
