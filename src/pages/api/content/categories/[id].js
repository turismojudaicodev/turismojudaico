import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const categoryId = parseInt(req.query.id)

    return new Promise((resolve, reject) => {
      db.query(
        `DELETE FROM categorias WHERE codigo=${categoryId}`,
        (err, data) => {
          if (err) {
            res
              .status(500)
              .json({ error: err.sqlMessage ?? 'Error al borrar categoría' })
            return resolve()
          }
          res.status(200).json({
            message: `Categoría con id "${categoryId}" borrada exitosamente`,
            data,
          })
          return resolve()
        }
      )
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
