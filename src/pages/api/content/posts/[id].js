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
    res.status(200).json({ message: `Post con id "..." borrado exitosamente` })
  } else if (req.method === 'PUT') {
    const postId = parseInt(req.query.id)
    const { body } = req

    try {
      res.status(200).json({
        data: result,
        message: `Post "$..." actualizado exitosamente`,
      })
    } catch (error) {
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
