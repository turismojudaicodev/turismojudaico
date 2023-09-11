import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = req.query
    let queryParams = []
    let limit = ''

    if (params.limit && params.offset) {
      limit = `LIMIT ${params.offset}, ${params.limit}`
    }
    if (params.pais) {
      queryParams.push(`pais=${params.pais}`)
      if (params.ciudad) {
        queryParams.push(`ciudad=${params.ciudad}`)
      }
    }
    if (params.categoria) {
      queryParams.push(`categoria=${params.categoria}`)
    }
    if (params.estado) {
      queryParams.push(`estado=${params.estado}`)
    }

    const queryString = `SELECT * FROM contenidos ${
      queryParams.length > 0 ? 'WHERE ' + queryParams.join(' AND ') : ''
    } ${limit}`

    console.log(queryString)

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
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
    const values = Object.values(body)

    const queryString = `INSERT INTO contenidos (${keys.join(',')})
    VALUES (${new Array(values.length).fill('?').join(',')})`

    return new Promise((resolve, reject) => {
      db.query(queryString, values, (err, data) => {
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
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
