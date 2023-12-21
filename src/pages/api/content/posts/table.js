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
      c.nombre AS ciudad 
    FROM contenidos ct
    INNER JOIN ciudades c ON ct.ciudad = c.codigo 
    INNER JOIN paises p ON ct.pais = p.codigo 
    GROUP BY ct.codigo
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
        res.status(200).json({ data })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
