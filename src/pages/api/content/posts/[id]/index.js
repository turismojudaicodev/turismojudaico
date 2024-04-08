import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const postId = parseInt(req.query.id)
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM contenidos WHERE codigo=${postId}`,
        (err, data) => {
          if (err) {
            res
              .status(500)
              .json({ error: err.sqlMessage || 'Error interno del servidor' })
            return resolve()
          }
          res.status(200).json({ data: data[0] })
          return resolve()
        }
      )
    })
  } else if (req.method === 'DELETE') {
    const postId = Number.parseInt(req.query.id)

    const queryString = `DELETE FROM contenidos WHERE codigo=${postId}`

    return new Promise((resolve, reject) => {
      // Start transaction
      db.query('START TRANSACTION', (startErr, startData) => {
        if (startErr) {
          console.log({ startErr })
          res
            .status(500)
            .json({ error: startErr.sqlMessage ?? 'Error al borrar el post' })
          return resolve()
        }

        // Insert into paquetes
        db.query(queryString, (insertPaquetesErr, insertPaquetesData) => {
          if (insertPaquetesErr) {
            console.log({ insertPaquetesErr })
            // Rollback on error
            db.query('ROLLBACK', (rollbackErr) => {
              if (rollbackErr) {
                console.log({ rollbackErr })
              }
              res.status(500).json({
                error: insertPaquetesErr.sqlMessage ?? 'Error al borrar post',
              })
              return resolve()
            })
          } else {
            // Get last inserted ID
            db.query(
              `DELETE FROM contenidos_x_categoria WHERE contenido=${postId}`,
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
                        insertCiudadesErr.sqlMessage ?? 'Error al borrar post',
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
                      message: `Post con id "${postId}" borrado exitosamente`,
                    })
                    return resolve()
                  })
                }
              }
            )
          }
        })
      })
    })
  } else if (req.method === 'PUT') {
    const postId = parseInt(req.query.id)
    const { body } = req
    const keys = Object.keys(body)
    const values = Object.values(body)
    const entries = Object.entries(body)

    const indexCategorias = keys.indexOf('categorias')

    const newSelectedCategories = values[indexCategorias]

    entries.splice(indexCategorias, 1)

    let colsToUpdate = ''
    const colsValues = []

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
      colsValues.push(
        !isNaN(parseInt(value)) && key !== 'telefono'
          ? parseInt(value)
          : `${value}`
      )
    })

    const queryString = `UPDATE contenidos SET ${colsToUpdate} WHERE codigo=${postId}`

    return new Promise((resolve, reject) => {
      // Start transaction
      db.query('START TRANSACTION', (startErr, startData) => {
        if (startErr) {
          console.log({ startErr })
          res
            .status(500)
            .json({ error: startErr.sqlMessage ?? 'Error al editar el post' })
          return resolve()
        }

        // Update de contenidos
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
                  error: insertPaquetesErr.sqlMessage ?? 'Error al editar post',
                })
                return resolve()
              })
            } else {
              if (newSelectedCategories.length > 0) {
                db.query(
                  `INSERT INTO contenidos_x_categoria VALUES ${newSelectedCategories
                    .map((category) => `(${postId}, ${category.codigo})`)
                    .join(',')}`,
                  (lastIdErr, lastIdData) => {
                    if (lastIdErr) {
                      console.log({ lastIdErr })
                      // Rollback on error
                      db.query('ROLLBACK', (rollbackErr) => {
                        if (rollbackErr) {
                          console.log({ rollbackErr })
                        }
                        res.status(500).json({
                          error: lastIdErr.sqlMessage ?? 'Error al editar post',
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
                          message: `Post "${body?.nombre}" editado exitosamente`,
                        })
                        return resolve()
                      })
                    }
                  }
                )
              } else {
                db.query('COMMIT', (commitErr) => {
                  if (commitErr) {
                    console.log({ commitErr })
                  }
                  res.status(201).json({
                    message: `Post "${body?.nombre}" editado exitosamente`,
                  })
                  return resolve()
                })
              }
            }
          }
        )
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
