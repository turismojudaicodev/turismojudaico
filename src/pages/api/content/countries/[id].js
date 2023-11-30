import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const countryId = parseInt(req.query.id)

    return new Promise((resolve, reject) => {
      db.query(
        `SELECT * FROM paises WHERE codigo=${countryId}`,
        (err, data) => {
          if (err) {
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error al obtener país' })
            return resolve()
          }
          res.status(200).json({ data: data[0] })
          return resolve()
        }
      )
    })
  } else if (req.method === 'DELETE') {
    const countryId = Number.parseInt(req.query.id)

    return new Promise((resolve, reject) => {
      db.query(`DELETE FROM paises WHERE codigo=${countryId}`, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al borrar país' })
          return resolve()
        }
        res
          .status(200)
          .json({ message: `País con id "${countryId}" borrado exitosamente` })
        return resolve()
      })
    })
  } else if (req.method === 'PUT') {
    const countryId = Number.parseInt(req.query.id)
    const { body } = req
    const entries = Object.entries(body)

    let colsToUpdate = []
    const colsValues = []

    entries.forEach(([key, value], i) => {
      if (
        value === '' ||
        value === undefined ||
        value === null ||
        (typeof value === 'object' && Object.keys(value).length === 0)
      )
        return // Para evitar setear en string vacio imagenes no cambiadas
      colsToUpdate.push(`${key}=?`)
      colsValues.push(value)
    })

    const queryString = `UPDATE paises SET ${colsToUpdate.join(
      ', '
    )} WHERE codigo=${countryId}`

    console.log(queryString)

    return new Promise((resolve, reject) => {
      db.query(queryString, colsValues, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al actualizar pais' })
          return resolve()
        }
        res.status(200).json({
          message: `Pais con id "${countryId}" actualizado exitosamente`,
        })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
