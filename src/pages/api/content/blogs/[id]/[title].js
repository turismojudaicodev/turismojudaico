import { db } from 'lib/mysql'
import { fixUrl } from 'helpers'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const blogId = parseInt(req.query.id)
    const blogTitle = req.query.title

    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM noticias WHERE codigo=${blogId}`, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar blog' })
          return resolve()
        }
        const blog = data[0]
        if (
          fixUrl(blog.nombre) !== blogTitle &&
          fixUrl(blog.nombre_en) !== blogTitle
        ) {
          return res
            .status(404)
            .json({ error: 'The searched content does not exist' })
        }
        res.status(200).json({ data: blog })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
