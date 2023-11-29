import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const params = req.query
    let queryParams = []

    if (params.estado) {
      queryParams.push(`pq.estado=${params.estado}`)
    }

    const queryString = `SELECT p.codigo, p.nombre, p.nombre_en, COUNT(*) as tours 
    FROM ciudades_x_paquete cxp 
    INNER JOIN ciudades c ON c.codigo = cxp.ciudad 
    INNER JOIN paises p ON p.codigo = c.pais 
    INNER JOIN paquetes pq ON pq.codigo = cxp.paquete ${
      queryParams.length > 0 ? 'WHERE ' + queryParams.join(' AND ') : ''
    } GROUP BY p.codigo`

    console.log(queryString)

    return new Promise((resolve, reject) => {
      db.query(queryString, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al cargar posts' })
          return resolve()
        }
        res.status(200).json({ data: data })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
