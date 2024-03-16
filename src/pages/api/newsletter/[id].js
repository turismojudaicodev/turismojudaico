import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const id = req.query.id

    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM newsletter WHERE codigo = ?',
        [id],
        (err, data) => {
          console.log(data)
          if (err) {
            console.log(err)
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error del servidor' })
            return resolve()
          }
          res.status(200).json({ data })
          return resolve()
        }
      )
    })
  } else if (req.method === 'DELETE') {
    const id = req.query.id

    return new Promise((resolve, reject) => {
      db.query('DELETE FROM newsletter WHERE codigo = ?', [id], (err, data) => {
        console.log(data)
        if (err) {
          console.log(err)
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error del servidor' })
          return resolve()
        }
        res
          .status(200)
          .json({ data, message: 'Suscripción borrada exitosamente' })
        return resolve()
      })
    })
  } else {
    return res.status(403).json({ error: 'Method not allowed' })
  }
}
