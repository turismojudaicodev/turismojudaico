import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM proveedores', (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage || 'Error al cargar proveedores' })
          return resolve()
        }
        res.status(200).json({ data })
        return resolve()
      })
    })
  } else if (req.method === 'POST') {
    return res
      .status(201)
      .json({ message: 'Implementar post para proveedores' })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
