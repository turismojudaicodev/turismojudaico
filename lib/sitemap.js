import { db } from './mysql'

export async function getToursIds() {
  return new Promise((resolve, reject) => {
    db.query('SELECT codigo FROM paquetes', (err, data) => {
      if (err) {
        console.log(err)
        res.status(500).json({ error: err.sqlMessage ?? 'Error del servidor' })
        return resolve()
      }
      return resolve(data)
    })
  })
}
