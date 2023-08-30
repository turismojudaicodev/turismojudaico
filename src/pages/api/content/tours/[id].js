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
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
