import { db } from '../../../lib/mysql'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const query = (sql) => new Promise((resolve, reject) => {
    db.query(sql, (err, results) => err ? reject(err) : resolve(results))
  })

  try {
    const bookings = await query(`
      SELECT * FROM bookings_pipeline 
      ORDER BY created_at DESC
    `)

    return res.status(200).json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}