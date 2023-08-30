import { isNumeric } from 'helpers'
import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const blogId = parseInt(req.query.id)
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM noticias WHERE codigo=${blogId}`, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar blog' })
          return resolve()
        }
        res.status(200).json({ data: data[0] })
        return resolve()
      })
    })
  } else if (req.method === 'DELETE') {
    const blogId = parseInt(req.query.id)
    return new Promise((resolve, reject) => {
      db.query(`DELETE FROM noticias WHERE codigo=${blogId}`, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al borrar blog' })
          return resolve()
        }
        res
          .status(200)
          .json({ messate: `Blog ${blogId} borrado exitosamente`, data })
        return resolve()
      })
    })
  } else if (req.method === 'PUT') {
    const blogId = parseInt(req.query.id)
    const { body } = req
    const entries = Object.entries(body).map(([key, value]) => {
      if (!isNumeric(value)) return [key, `"${value}"`]
      return [key, value]
    })

    let colUpdates = ''
    entries.forEach((entry, i) => {
      colUpdates += `${entry.join('=')}`
      if (i !== entries.length - 1) colUpdates += ', '
    })

    return new Promise((resolve, reject) => {
      db.query(
        `UPDATE noticias SET ${colUpdates} WHERE codigo=${blogId}`,
        (err, data) => {
          if (err) {
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error al actualizar blog' })
            return resolve()
          }
          res
            .status(200)
            .json({ message: `Blog ${blogId} actualizado exitosamente`, data })
          return resolve()
        }
      )
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
