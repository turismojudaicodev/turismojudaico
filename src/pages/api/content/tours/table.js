import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const queryString = `
    SELECT 
      t.codigo, 
      t.nombre, 
      t.nombre_en, 
      t.destacadohomegrande, 
      t.destacadohomechico, 
      t.orden, 
      t.estado, 
      t.fechacreacion, 
      p.nombre AS pais, 
      c.nombre AS ciudad 
    FROM paquetes t 
    INNER JOIN ciudades_x_paquete cxp ON t.codigo = cxp.paquete 
    INNER JOIN ciudades c ON cxp.ciudad = c.codigo 
    INNER JOIN paises p ON c.pais = p.codigo 
    GROUP BY t.codigo
    ORDER BY t.orden`

    console.log(queryString)

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
        console.log({ data })
        if (err) {
          console.log(err)
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar tours' })
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
