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
    if (params.categoria) {
      queryParams.push(`categoria=${params.categoria}`)
    }
    if (params.estado) {
      queryParams.push(`estado=${params.estado}`)
    }
    if (params.nombre) {
      queryParams.push(`nombre LIKE "%${params.nombre}%"`)
    }
    if (params.nombre_en) {
      queryParams.push(`nombre_en LIKE "%${params.nombre_en}%"`)
    }

    const queryString = `SELECT pais, COUNT(pais) as total FROM contenidos ${
      queryParams.length > 0 ? 'WHERE ' + queryParams.join(' AND ') : ''
    } GROUP BY pais`

    console.log(queryString)

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar posts' })
          return resolve()
        }
        res.status(200).json({ data: data })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
