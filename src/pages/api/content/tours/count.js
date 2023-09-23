import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = req.query
    let queryParams = []

    if (params.pais) {
      queryParams.push(`pais=${params.pais}`)
      if (params.ciudad) {
        queryParams.push(`ciudad=${params.ciudad}`)
      }
    }
    if (params.estado) {
      queryParams.push(`estado=${params.estado}`)
    }

    const queryString = `SELECT COUNT(codigo) as total FROM paquetes ${
      queryParams.length > 0 ? 'WHERE ' + queryParams.join(' AND ') : ''
    }`

    console.log(queryString)

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar tours' })
          return resolve()
        }
        res.status(200).json({ data: data[0] })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
