import { db } from 'lib/mysql'
import { fixUrl } from 'helpers'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = req.query

    const tourId = parseInt(params.id)
    const tourTitle = params.title

    let queryString = `SELECT * FROM paquetes WHERE codigo=${tourId}`

    if (params.includeCity == 'true') {
      queryString = `
        SELECT 
          t.*, 
          p.codigo AS pais, 
          c.codigo AS ciudad 
        FROM paquetes t 
        LEFT JOIN ciudades_x_paquete cxp ON t.codigo = cxp.paquete 
        LEFT JOIN ciudades c ON cxp.ciudad = c.codigo 
        LEFT JOIN paises p ON c.pais = p.codigo 
        WHERE t.codigo = ${tourId}
        GROUP BY t.codigo
        ORDER BY t.orden
      `
    }

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar tour' })
          return resolve()
        }
        const tour = data[0]
        if (
          fixUrl(tour.nombre) !== tourTitle &&
          fixUrl(tour.nombre_en) !== tourTitle
        ) {
          return res
            .status(404)
            .json({ error: 'The searched content does not exist' })
        }
        res.status(200).json({ data: tour })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
