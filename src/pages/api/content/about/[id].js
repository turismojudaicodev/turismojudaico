import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const blogId = parseInt(req.query.id)
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM quienessomos WHERE codigo=${blogId}`,
        (err, data) => {
          if (err) {
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error al cargar descripción' })
            return resolve()
          }
          res.status(200).json({ data: data[0] })
          return resolve()
        }
      )
    })
  } else if (req.method === 'DELETE') {
    const blogId = parseInt(req.query.id)
    return new Promise((resolve, reject) => {
      db.query(
        `DELETE FROM quienessomos WHERE codigo=${blogId}`,
        (err, data) => {
          if (err) {
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error al borrar descripción' })
            return resolve()
          }
          res
            .status(200)
            .json({ message: `Descripción ${blogId} borrado exitosamente` })
          return resolve()
        }
      )
    })
  } else if (req.method === 'PUT') {
    const blogId = parseInt(req.query.id)
    const { body } = req
    const entries = Object.entries(body)

    let colsToUpdate = ''
    const colsValues = []
    entries.forEach(([key, value], i) => {
      if (value === '""') return // Para evitar setear en string vacio imagenes no cambiadas
      colsToUpdate += `${key}=?`
      if (i !== entries.length - 1) colsToUpdate += ', '
      colsValues.push(value)
    })

    const queryString = `UPDATE quienessomos SET ${colsToUpdate} WHERE codigo=${blogId}`

    return new Promise((resolve, reject) => {
      db.query(queryString, colsValues, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({
              error: err.sqlMessage ?? 'Error al actualizar descripción',
            })
          return resolve()
        }
        res
          .status(200)
          .json({
            message: `Descripción ${blogId} actualizada exitosamente`,
            data,
          })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
