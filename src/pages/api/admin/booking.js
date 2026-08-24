import { db } from '../../../../lib/mysql'

export default async function handler(req, res) {
  const query = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => err ? reject(err) : resolve(results))
  })

  // GET: Traer reservas
  if (req.method === 'GET') {
    try {
      const bookings = await query(`SELECT * FROM bookings_pipeline ORDER BY created_at DESC`)
      return res.status(200).json(bookings)
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener reservas' })
    }
  }

  if (req.method === 'PUT') {
    const { id, status, client_name, client_email, destination_name, tour_date, pax_adults } = req.body
    
    try {
      if (status && !client_name) {
        await query(`UPDATE bookings_pipeline SET status = ? WHERE id = ?`, [status, id])
      } 
      else {
        await query(`
          UPDATE bookings_pipeline 
          SET client_name = ?, client_email = ?, destination_name = ?, tour_date = ?, pax_adults = ?, status = ?
          WHERE id = ?
        `, [client_name, client_email, destination_name, tour_date, pax_adults, status, id])
      }
      
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Error al actualizar reserva' })
    }
  }
if (req.method === 'DELETE') {
    const { id } = req.body
    try {
      await query(`DELETE FROM bookings_pipeline WHERE id = ?`, [id])
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Error al borrar la reserva' })
    }
  }
  
  return res.status(405).json({ error: 'Método no permitido' })
}