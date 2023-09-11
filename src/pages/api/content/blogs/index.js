import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = req.query
    let queryParams = []
    let limit = ''

    if (params.limit && params.offset) {
      limit = `LIMIT ${params.offset}, ${params.limit}`
    }
    if (params.estado) {
      queryParams.push(`estado=${params.estado}`)
    }

    const queryString = `SELECT * FROM noticias ${
      queryParams.length > 0 ? 'WHERE ' + queryParams.join(' AND ') : ''
    } ${limit}`

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

    const queryString = `INSERT INTO noticias (${keys.join(',')})
    VALUES (${new Array(values.length).fill('?').join(',')})`

    return new Promise((resolve, reject) => {
      db.query(queryString, values, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al crear blog' })
          return resolve()
        }
        res.status(201).json({ message: 'Blog creado exitosamente', data })
        return resolve()
      })
    })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
