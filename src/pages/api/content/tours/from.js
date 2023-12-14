import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = req.query

    if (!params.pais) {
      return res.status(400).json({ error: 'Falta especificar país' })
    }

    const queryString = `SELECT DISTINCT t.codigo, t.nombre, t.nombre_en, t.imagen1, t.descripcioncorta, t.descripcioncorta_en
      FROM paquetes t 
      INNER JOIN ciudades_x_paquete cxp ON t.codigo = cxp.paquete 
      INNER JOIN ciudades c ON cxp.ciudad = c.codigo 
      WHERE t.estado = 1 AND c.pais = ?`

    console.log(queryString)

    return new Promise((resolve, reject) => {
      db.query(queryString, [params.pais], (err, data) => {
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
