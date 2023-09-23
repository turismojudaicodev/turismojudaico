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

    console.log(entries)

    // return new Promise((resolve, reject) => {
    //   db.query(
    //     `UPDATE paises SET ... WHERE codigo=${countryId}`,
    //     (err, data) => {
    //       if (err) {
    //         res
    //           .status(500)
    //           .json({ error: err.sqlMessage ?? 'Error al borrar país' })
    //         return resolve()
    //       }
    //       res
    //         .status(200)
    //         .json({
    //           message: `País con id "${countryId}" borrado exitosamente`,
    //         })
    //       return resolve()
    //     }
    //   )
    // })
    return res.status(200).json({ message: 'ok' })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
