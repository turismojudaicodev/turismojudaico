import { fixUrl } from 'helpers'
import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const postId = parseInt(req.query.id)
    const postTitle = req.query.title

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
          const post = data[0]
          if (
            fixUrl(post.nombre) !== postTitle &&
            fixUrl(post.nombre_en) !== postTitle
          ) {
            return res
              .status(404)
              .json({ error: 'The searched content does not exist' })
          }
          res.status(200).json({ data: post })
          return resolve()
        }
      )
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
