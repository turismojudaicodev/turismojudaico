import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = req.query

    const tourId = parseInt(params.id)

    let queryString = `SELECT * FROM paquetes WHERE codigo=${tourId}`

    if (params.includeCity == 'true') {
      queryString = `
        SELECT 
          t.*, 
          p.codigo AS pais, 
          c.codigo AS ciudad 
        FROM paquetes t 
        LEFT JOIN ciudades_x_paquete cxp ON t.codigo = cxp.paquete 
        LEFT JOIN ciudades c ON cxp.ciudad = c.codigo 
        LEFT JOIN paises p ON c.pais = p.codigo 
        WHERE t.codigo = ${tourId}
        GROUP BY t.codigo
        ORDER BY t.orden
      `
    }

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar tour' })
          return resolve()
        }
        res.status(200).json({ data: data[0] })
        return resolve()
      })
    })
  } else if (req.method === 'DELETE') {
    const tourId = parseInt(req.query.id)
    return new Promise((resolve, reject) => {
      // Start transaction
      db.query('START TRANSACTION', (startErr, startData) => {
        if (startErr) {
          console.log({ startErr })
          res
            .status(500)
            .json({ error: startErr.sqlMessage ?? 'Error al eliminar tour' })
          return resolve()
        }

        // Delete from ciudades_x_paquete
        db.query(
          `DELETE FROM ciudades_x_paquete WHERE paquete=${tourId}`,
          (deleteCiudadesErr, deleteCiudadesData) => {
            if (deleteCiudadesErr) {
              console.log({ deleteCiudadesErr })
              // Rollback on error
              db.query('ROLLBACK', (rollbackErr) => {
                if (rollbackErr) {
                  console.log({ rollbackErr })
                }
                res.status(500).json({
                  error:
                    deleteCiudadesErr.sqlMessage ?? 'Error al eliminar tour',
                })
                return resolve()
              })
            } else {
              // Delete from paquetes
              db.query(
                `DELETE FROM paquetes WHERE codigo=${tourId}`,
                (deletePaquetesErr, deletePaquetesData) => {
                  if (deletePaquetesErr) {
                    console.log({ deletePaquetesErr })
                    // Rollback on error
                    db.query('ROLLBACK', (rollbackErr) => {
                      if (rollbackErr) {
                        console.log({ rollbackErr })
                      }
                      res.status(500).json({
                        error:
                          deletePaquetesErr.sqlMessage ??
                          'Error al eliminar tour',
                      })
                      return resolve()
                    })
                  } else {
                    // Commit the transaction
                    db.query('COMMIT', (commitErr) => {
                      if (commitErr) {
                        console.log({ commitErr })
                      }
                      res.status(200).json({
                        message: `Tour ${tourId} eliminado exitosamente`,
                      })
                      return resolve()
                    })
                  }
                }
              )
            }
          }
        )
      })
    })
  } else if (req.method === 'PUT') {
    const tourId = parseInt(req.query.id)
    const { body } = req
    const keys = Object.keys(body)
    let values = Object.values(body)
    const entries = Object.entries(body)

    let colsToUpdate = ''
    const colsValues = []

    const indexPais = keys.indexOf('pais')
    const indexCiudad = keys.indexOf('ciudad')

    const selectedCity = parseInt(values[indexCiudad])

    // Saca pais y ciudad de la query a la tabla paquetes
    entries.splice(indexPais, 2)

    entries.forEach(([key, value], i) => {
      if (
        value === '' ||
        value === undefined ||
        value === null ||
        (typeof value === 'object' && Object.keys(value).length === 0)
      )
        return // Para evitar setear en string vacio imagenes no cambiadas
      colsToUpdate += `${key}=?`
      if (i !== entries.length - 1) colsToUpdate += ', '
      colsValues.push(!isNaN(parseInt(value)) ? parseInt(value) : `${value}`)
    })

    const queryString = `UPDATE paquetes SET ${colsToUpdate} WHERE codigo=${tourId}`

    console.log(queryString)

    return new Promise((resolve, reject) => {
      // Start transaction
      db.query('START TRANSACTION', (startErr, startData) => {
        if (startErr) {
          console.log({ startErr })
          res
            .status(500)
            .json({ error: startErr.sqlMessage ?? 'Error al editar tour' })
          return resolve()
        }

        // Insert into paquetes
        db.query(
          queryString,
          colsValues,
          (insertPaquetesErr, insertPaquetesData) => {
            if (insertPaquetesErr) {
              console.log({ insertPaquetesErr })
              // Rollback on error
              db.query('ROLLBACK', (rollbackErr) => {
                if (rollbackErr) {
                  console.log({ rollbackErr })
                }
                res.status(500).json({
                  error: insertPaquetesErr.sqlMessage ?? 'Error al editar tour',
                })
                return resolve()
              })
            } else {
              // Get last inserted ID

              // Insert into ciudades_x_paquete
              db.query(
                `UPDATE ciudades_x_paquete SET ciudad=${selectedCity} WHERE paquete=${tourId}`,
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
                          'Error al editar tour',
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
                        message: `Tour "${body?.nombre}" editado exitosamente`,
                      })
                      return resolve()
                    })
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
