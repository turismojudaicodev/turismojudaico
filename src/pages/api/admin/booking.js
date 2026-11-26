import { withAdmin } from '../../../../lib/session'
import { db } from '../../../../lib/mysql'
import { findDraftByBookingId, sendExistingDraft } from '../../../../lib/gmail';
import { syncBookingToSheetSafe } from '../../../../lib/sheets'

const STATUSES = [
  'INQUIRY_RECEIVED', 'PENDING_SECURITY_VETTING', 'SECURITY_DOCS_RECEIVED', 'SECURITY_APPROVED',
  'SECURITY_REJECTED', 'PENDING_DEPOSIT', 'DEPOSIT_PAID', 'CONFIRMED_ASSIGNED', 'COMPLETED', 'CANCELLED',
]

// Busca por id numérico O por uuid, nunca por los dos a la vez:
// en MariaDB/MySQL "id = '65abc...'" convierte el texto a 65 y puede tocar otra reserva.
const whereFor = (value) => {
  const v = String(value ?? '').trim()
  if (/^\d+$/.test(v)) return { sql: 'id = ?', param: Number(v) }
  if (/^[0-9a-f-]{36}$/i.test(v)) return { sql: 'booking_uuid = ?', param: v }
  return null
}

async function handler(req, res) {
  const query = (sql, params) => new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => err ? reject(err) : resolve(results))
  })

  // GET: Traer reservas
  if (req.method === 'GET') {
    try {
      const bookings = await query(`SELECT * FROM bookings_pipeline ORDER BY created_at DESC`)
      // Zelle informados por el cliente que falta verificar (para marcarlos en el panel).
      try {
        const reported = await query(`SELECT booking_uuid FROM booking_payments WHERE status = 'REPORTED'`, [])
        const counts = {}
        for (const r of reported) counts[r.booking_uuid] = (counts[r.booking_uuid] || 0) + 1
        for (const b of bookings) b.payments_reported = counts[b.booking_uuid] || 0
      } catch (error) {
        console.error('Reservas: no se pudieron leer los pagos (¿falta la migración 004?)', error.code || error)
      }
      return res.status(200).json(bookings)
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener reservas' })
    }
  }

  if (req.method === 'PUT') {
    const { id, booking_uuid, status, client_name, client_email, destination_name, tour_date, pax_adults } = req.body || {};
    const where = whereFor(id ?? booking_uuid)
    if (!where) return res.status(400).json({ error: 'Falta el id de la reserva' })
    if (status && !STATUSES.includes(status)) return res.status(400).json({ error: `Estado inválido: ${status}` })

    try {
      const rows = await query(`SELECT booking_uuid, status FROM bookings_pipeline WHERE ${where.sql}`, [where.param])
      if (rows.length === 0) {
        return res.status(404).json({ error: `El registro no existe en MySQL.` });
      }
      const current = rows[0]

      if (status && !client_name) {
        await query(`UPDATE bookings_pipeline SET status = ? WHERE ${where.sql}`, [status, where.param])
      } else {
        await query(`
          UPDATE bookings_pipeline
          SET client_name = ?, client_email = ?, destination_name = ?, tour_date = ?, pax_adults = ?, status = ?
          WHERE ${where.sql}
        `, [client_name, client_email, destination_name, tour_date, pax_adults, status || current.status, where.param])
      }

      // "Pasar a Seguridad": recién con el cambio guardado se envía el borrador que se armó al recibir la consulta
      // (incluye el link al formulario de seguridad).
      let mailSent = null
      if (status === 'PENDING_SECURITY_VETTING' && current.status === 'INQUIRY_RECEIVED') {
        const ids = await findDraftByBookingId(current.booking_uuid);
        mailSent = !!(ids && ids.draftId && await sendExistingDraft(ids.draftId));
      }

      // Si la reserva ya tiene pagos, la planilla refleja el cambio (fecha, nombre, pax, cancelación).
      await syncBookingToSheetSafe(current.booking_uuid)

      return res.status(200).json({ success: true, mailSent })
    } catch (error) {
      console.error('🔥 Error PUT:', error)
      return res.status(500).json({ error: 'Error al actualizar reserva' })
    }
  }

  if (req.method === 'DELETE') {
    const where = whereFor((req.body || {}).id)
    if (!where) {
      return res.status(400).json({ error: 'Falta el ID de la reserva' });
    }

    try {
      const result = await query(`DELETE FROM bookings_pipeline WHERE ${where.sql}`, [where.param]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: `El registro no existe en MySQL.` });
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      // La FK de booking_payments no deja borrar una reserva con pagos registrados.
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
        return res.status(409).json({ error: 'La reserva tiene pagos registrados: no se puede borrar. Cancelala en su lugar.' })
      }
      console.error('Error al borrar en MySQL:', error);
      return res.status(500).json({ error: 'Error al borrar la reserva' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}

export default withAdmin(handler)
