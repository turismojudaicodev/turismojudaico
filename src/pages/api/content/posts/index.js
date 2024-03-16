import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = req.query
    let queryParams = []
    let limit = ''
    let joinCategories = ''

    if (params.limit && params.offset) {
      limit = `LIMIT ${params.offset}, ${params.limit}`
    }
    if (params.pais) {
      queryParams.push(`pais=${params.pais}`)
      if (params.ciudad) {
        queryParams.push(`ciudad=${params.ciudad}`)
      }
    }
    if (params.joinCategories) {
      joinCategories = `LEFT JOIN contenidos_x_categoria cxc ON cxc.contenido = contenidos.codigo`
    }
    if (params.categoria) {
      queryParams.push(`cxc.categoria=${params.categoria}`)
      joinCategories = `INNER JOIN contenidos_x_categoria cxc ON cxc.contenido = contenidos.codigo`
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

    const queryString = `SELECT * FROM contenidos ${joinCategories} ${
      queryParams.length > 0 ? 'WHERE ' + queryParams.join(' AND ') : ''
    } ${
      joinCategories.length > 0 ? 'GROUP BY contenidos.codigo' : ''
    } ORDER BY contenidos.orden ${limit}`

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

    const indexCategorias = keys.indexOf('categorias')

    const selectedCategories = values[indexCategorias]

    keys.splice(indexCategorias, 1)
    values.splice(indexCategorias, 1)

    const queryString = `INSERT INTO contenidos (${keys.join(',')})
    VALUES (${new Array(values.length).fill('?').join(',')})`

    console.log(queryString)

    return new Promise((resolve, reject) => {
      // Start transaction
      db.query('START TRANSACTION', (startErr, startData) => {
        if (startErr) {
          console.log({ startErr })
          res
            .status(500)
            .json({ error: startErr.sqlMessage ?? 'Error al crear el post' })
          return resolve()
        }

        // Insert into paquetes
        db.query(
          queryString,
          values,
          (insertPaquetesErr, insertPaquetesData) => {
            if (insertPaquetesErr) {
              console.log({ insertPaquetesErr })
              // Rollback on error
              db.query('ROLLBACK', (rollbackErr) => {
                if (rollbackErr) {
                  console.log({ rollbackErr })
                }
                res.status(500).json({
                  error: insertPaquetesErr.sqlMessage ?? 'Error al crear post',
                })
                return resolve()
              })
            } else {
              // Get last inserted ID
              db.query(
                'SELECT LAST_INSERT_ID() as lastId',
                (lastIdErr, lastIdData) => {
                  if (lastIdErr) {
                    console.log({ lastIdErr })
                    // Rollback on error
                    db.query('ROLLBACK', (rollbackErr) => {
                      if (rollbackErr) {
                        console.log({ rollbackErr })
                      }
                      res.status(500).json({
                        error: lastIdErr.sqlMessage ?? 'Error al crear post',
                      })
                      return resolve()
                    })
                  } else {
                    const lastId = lastIdData[0].lastId

                    // Insert into ciudades_x_paquete
                    db.query(
                      `INSERT INTO contenidos_x_categoria (contenido, categoria) VALUES ${selectedCategories
                        .map((category) => `(${lastId}, ${category.codigo})`)
                        .join(',')}`,
                      (insertCiudadesErr, insertCiudadesData) => {
                        if (insertCiudadesErr) {
                          console.log({ insertCiudadesErr })
                          // Rollback on error
                          db.query('ROLLBACK', (rollbackErr) => {
                            if (rollbackErr) {
                              console.log({ rollbackErr })
                            }
                            res.status(500).json({
                              error:
                                insertCiudadesErr.sqlMessage ??
                                'Error al crear post',
                            })
                            return resolve()
                          })
                        } else {
                          // Commit the transaction
                          db.query('COMMIT', (commitErr) => {
                            if (commitErr) {
                              console.log({ commitErr })
                            }
                            res.status(201).json({
                              message: `Post "${body?.nombre}" creado exitosamente`,
                            })
                            return resolve()
                          })
                        }
                      }
                    )
                  }
                }
              )
            }
          }
        )
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
