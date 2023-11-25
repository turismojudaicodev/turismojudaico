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

    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM reservas ORDER BY codigo DESC LIMIT ?, ?',
        [Number(params.offset) || 0, Number(params.limit) || 5],
        (err, data) => {
          console.log(data)
          if (err) {
            console.log(err)
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error del servidor' })
            return resolve()
          }
          res.status(200).json({ data })
          return resolve()
        }
      )
    })
  } else if (req.method === 'DELETE') {
    return res.status(500).json({ error: 'Error del servidor' })
  } else {
    return res.status(403).json({ error: 'Method not allowed' })
  }
}
