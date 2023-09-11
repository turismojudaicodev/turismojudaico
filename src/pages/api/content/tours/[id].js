import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const tourId = parseInt(req.query.id)
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM paquetes WHERE codigo=${tourId}`, (err, data) => {
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
      db.query(`DELETE FROM paquetes WHERE codigo=${tourId}`, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al borrar tour' })
          return resolve()
        }
        res
          .status(200)
          .json({ message: `Tour con id "${tourId}" borrado exitosamente` })
        return resolve()
      })
    })
  } else if (req.method === 'PUT') {
    const tourId = parseInt(req.query.id)
    const { body } = req
    const entries = Object.entries(body)

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
      colsValues.push(value)
    })

    const queryString = `UPDATE paquetes SET ${colsToUpdate} WHERE codigo=${tourId}`

    return new Promise((resolve, reject) => {
      db.query(queryString, colsValues, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al editar tour' })
          return resolve()
        }
        res.status(200).json({
          data,
          message: `Tour con id "${tourId}" actualizado exitosamente`,
        })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
