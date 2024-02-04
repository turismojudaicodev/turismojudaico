import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = req.query
    let queryParams = []
    let limit = ''

    if (params.limit) {
      if (params.offset) {
        limit = `LIMIT ${params.offset}, ${params.limit}`
      } else {
        limit = `LIMIT ${params.limit}`
      }
    }
    if (params.estado) {
      queryParams.push(`estado=${params.estado}`)
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
      const words = params.nombre.split(' ')
      words.forEach((word, i) => {
        words[i] = `(nombre LIKE "%${word}%" OR nombre_en LIKE "%${word}%")`
      })
      const string = `(${words.join(' AND ')})`
      queryParams.push(string)
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
    let values = Object.values(body)

    const indexPais = keys.indexOf('pais')
    const indexCiudad = keys.indexOf('ciudad')

    const selectedCity = parseInt(values[indexCiudad])

    keys.splice(indexPais, 2)
    values.splice(indexPais, 2)

    values = values.map((value) =>
      !isNaN(parseInt(value)) ? value : `"${value}"`
    )

    return new Promise((resolve, reject) => {
      // Start transaction
      db.query('START TRANSACTION', (startErr, startData) => {
        if (startErr) {
          console.log({ startErr })
          res
            .status(500)
            .json({ error: startErr.sqlMessage ?? 'Error al crear tour' })
          return resolve()
        }

        // Insert into paquetes
        db.query(
          `INSERT INTO paquetes (${keys.join(',')}) VALUES (${values.join(
            ','
          )})`,
          (insertPaquetesErr, insertPaquetesData) => {
            if (insertPaquetesErr) {
              console.log({ insertPaquetesErr })
              // Rollback on error
              db.query('ROLLBACK', (rollbackErr) => {
                if (rollbackErr) {
                  console.log({ rollbackErr })
                }
                res.status(500).json({
                  error: insertPaquetesErr.sqlMessage ?? 'Error al crear tour',
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
                        error: lastIdErr.sqlMessage ?? 'Error al crear tour',
                      })
                      return resolve()
                    })
                  } else {
                    const lastId = lastIdData[0].lastId

                    // Insert into ciudades_x_paquete
                    db.query(
                      `INSERT INTO ciudades_x_paquete (paquete, ciudad) VALUES (${lastId}, ${selectedCity})`,
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
                                'Error al crear tour',
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
                              message: `Tour "${body?.nombre}" creado exitosamente`,
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
    res.status(405).json({ error: 'Method not allowed' })
  }
}
