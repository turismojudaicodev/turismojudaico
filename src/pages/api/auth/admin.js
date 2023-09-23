import { setCookie } from 'cookies-next'
import { db } from 'lib/mysql'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body

    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM usuarios WHERE usuario = ? AND clave = ?',
        [username, password],
        (err, data) => {
          if (err) {
            console.log('error', error)
            res.status(500).json({ error: 'Error interno del servidor' })
            return resolve()
          }
          if (data.length === 0) {
            res.status(400).json({ error: 'Usuario o contraseña incorrecto' })
          }
          console.log('data', data)
          setCookie(
            'user',
            JSON.stringify({ username, password, role: 'ADMIN' }),
            {
              req,
              res,
              maxAge: 60 * 60 * 24,
            }
          )
          res.status(201).json({ username, password, role: 'ADMIN' })
          return resolve()
        }
      )
    })
  }
}
