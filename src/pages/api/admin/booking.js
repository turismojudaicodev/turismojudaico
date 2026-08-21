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

  // PUT: Actualizar reservas (Estado o datos)
  if (req.method === 'PUT') {
    const { id, status, client_name, pax_adults } = req.body
    
    try {
      // Si solo mandamos status, actualizamos estado
      if (status) {
        await query(`UPDATE bookings_pipeline SET status = ? WHERE id = ?`, [status, id])
      } 
      // (Aquí luego agregaremos los demás campos para editar)
      
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Error al actualizar reserva' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}