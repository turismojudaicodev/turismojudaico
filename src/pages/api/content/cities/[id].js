import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const cityId = parseInt(req.query.id)

    return new Promise((resolve, reject) => {
      db.query(`DELETE FROM ciudades WHERE codigo=${cityId}`, (err, data) => {
        if (err) {
          res
            .status(500)
            .json({ error: err.sqlMessage ?? 'Error al borrar ciudad' })
          return resolve()
        }
        res.status(200).json({
          message: `Ciudad con id "${cityId}" borrada exitosamente`,
          data,
        })
        return resolve()
      })
    })
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}
