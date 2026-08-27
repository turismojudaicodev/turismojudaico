import { db } from '../../../../lib/mysql'
import { findDraftByBookingId, sendExistingDraft } from '../../../../lib/gmail';

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
    const { id, booking_uuid, status, client_name, client_email, destination_name, tour_date, pax_adults } = req.body;
    
    try {
      let result;

      // --- BLOQUE CORREGIDO: Faltaba cerrar esta llave ---
      if (status === 'PENDING_SECURITY_VETTING') {
        const rows = await query(`SELECT booking_uuid FROM bookings_pipeline WHERE id = ?`, [id]);
        const realUuid = rows.length > 0 ? rows[0].booking_uuid : id;

        const ids = await findDraftByBookingId(realUuid);
        
        if (ids && ids.draftId) {
          await sendExistingDraft(ids.draftId);
        }
      } // <--- ESTA ERA LA LLAVE QUE FALTABA
      // ---------------------------------------------------
      
      if (status && !client_name) {
        result = await query(`UPDATE bookings_pipeline SET status = ? WHERE id = ? OR booking_uuid = ?`, [status, id, id])
      } else {
        result = await query(`
          UPDATE bookings_pipeline 
          SET client_name = ?, client_email = ?, destination_name = ?, tour_date = ?, pax_adults = ?, status = ?
          WHERE id = ? OR booking_uuid = ?
        `, [client_name, client_email, destination_name, tour_date, pax_adults, status, id, id])
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: `El registro no existe en MySQL.` });
      }
      
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('🔥 Error PUT:', error)
      return res.status(500).json({ error: 'Error al actualizar reserva' })
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Falta el ID de la reserva' });
    }

    try {
      const result = await query(`DELETE FROM bookings_pipeline WHERE id = ? OR booking_uuid = ?`, [id, id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: `El registro no existe en MySQL.` });
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error al borrar en MySQL:', error);
      return res.status(500).json({ error: 'Error al borrar la reserva' });
    }
  }
  
  return res.status(405).json({ error: 'Método no permitido' })
}