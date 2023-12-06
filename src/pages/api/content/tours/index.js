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
    if (params.pais) {
      // ver como fetchear tours filtrando por pais
    }
    if (params.destacadohomegrande) {
      queryParams.push('destacadohomegrande=1')
    }
    if (params.destacadohomechico) {
      queryParams.push('destacadohomechico=1')
    }
    if (params.proveedor) {
      queryParams.push(`proveedor=${params.proveedor}`)
    }
    if (params.nombre) {
      queryParams.push(`nombre LIKE "%${params.nombre}%"`)
    }
    if (params.nombre_en) {
      queryParams.push(`nombre_en LIKE "%${params.nombre_en}%"`)
    }

    const queryString = `SELECT * FROM paquetes ${
      queryParams.length > 0 ? 'WHERE ' + queryParams.join(' AND ') : ''
    } ORDER BY orden ASC ${limit}`

    console.log(queryString)

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar tours' })
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
    // let tourCityId = null,
    //   tourId = null

    // if (keys.includes('ciudad')) {
    //   tourCityid = body.ciudad

    //   new Promise((resolve, reject) => {
    //     db.query(
    //       'INSERT INTO ciudades_x_paquete (paquete, ciudad) VALUES',
    //       [tourId, tourCityId],
    //       (err, data) => {
    //         if (err) {
    //           res
    //             .status(500)
    //             .json({ error: err.sqlMessage ?? 'Error al setear ciudad' })
    //           reject()
    //         }
    //         res.status(201).json({
    //           data,
    //           message: `Tour "${body?.nombre}" creado exitosamente`,
    //         })
    //         resolve()
    //       }
    //     )
    //   })
    // }

    const queryString = `INSERT INTO paquetes (${keys.join(',')})
    VALUES (${new Array(values.length).fill('?').join(',')})`

    return new Promise((resolve, reject) => {
      db.query(queryString, values, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al crear tour' })
          return resolve()
        }
        res.status(201).json({
          data,
          message: `Tour "${body?.nombre}" creado exitosamente`,
        })
        return resolve()
      })
    })
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
