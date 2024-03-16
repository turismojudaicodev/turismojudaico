import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id, categoryId } = req.query

    const queryString = `DELETE FROM contenidos_x_categoria WHERE contenido=${id} AND categoria=${categoryId}`

    console.log(queryString)

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
        if (err) {
          res.status(500).json({
            error:
              err.sqlMessage ??
              `Error al borrar categoria ${categoryId} del post`,
          })
          return resolve()
        }
        res
          .status(200)
          .json({ data, message: 'Categoría eliminada correctamente' })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
