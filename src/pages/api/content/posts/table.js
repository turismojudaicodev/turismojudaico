import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const queryString = `
    SELECT 
      ct.codigo, 
      ct.nombre, 
      ct.nombre_en,
      ct.orden, 
      ct.estado, 
      p.nombre AS pais, 
      c.nombre AS ciudad,
      cat.nombre AS categoria
    FROM contenidos ct
    LEFT JOIN contenidos_x_categoria cxc ON cxc.contenido = ct.codigo
    LEFT JOIN categorias cat ON cat.codigo = cxc.categoria
    LEFT JOIN ciudades c ON ct.ciudad = c.codigo 
    LEFT JOIN paises p ON ct.pais = p.codigo 
    ORDER BY ct.orden`

    console.log(queryString)

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
        if (err) {
          console.log(err)
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar posts' })
          return resolve()
        }
        const posts = data.reduce((acc, row) => {
          const { codigo, categoria } = row
          if (!acc[codigo]) {
            acc[codigo] = { ...row, categorias: [categoria] }
          } else {
            acc[codigo].categorias.push(categoria)
          }
          return acc
        }, {})
        const postsOrderedByOrder = Object.values(posts).sort(
          (a, b) => a.orden - b.orden
        )
        res.status(200).json({ data: postsOrderedByOrder })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
