import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const postId = req.query.id

    console.log({ query: req.query })

    const queryString = `SELECT cxc.contenido, c.codigo, c.nombre, c.nombre_en from categorias c 
    RIGHT JOIN contenidos_x_categoria cxc ON cxc.categoria = c.codigo 
    WHERE cxc.contenido = ${postId};
    `

    console.log(queryString)

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
        if (err) {
          res.status(500).json({
            error: err.sqlMessage ?? 'Error al cargar categorias del post',
          })
          return resolve()
        }
        res.status(200).json({ data })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
