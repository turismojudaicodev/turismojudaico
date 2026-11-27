import { withAdmin } from '../../../../lib/session'
import { db } from '../../../../lib/mysql'
import { sendConfirmation } from '../../../../lib/voucher'

// GET: guías activos (para el selector del panel).
// POST { booking_uuid, guide_id }: asigna el guía a la reserva (guide_id null lo saca).
//   Si la seña ya está registrada, manda la confirmación en el momento.
async function handler(req, res) {
  const q = async (sql, params = []) => (await db.promise().query(sql, params))[0]

  if (req.method === 'GET') {
    try {
      const guides = await q('SELECT id, full_name, phone, city, country FROM guides WHERE is_active = 1 ORDER BY city, full_name')
      return res.status(200).json(guides)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Error al leer los guías' })
    }
  }

  if (req.method === 'POST') {
    const { booking_uuid, guide_id } = req.body || {}
    if (!/^[0-9a-f-]{36}$/i.test(String(booking_uuid || ''))) return res.status(400).json({ error: 'uuid inválido' })
    const gid = guide_id === null || guide_id === '' || guide_id === undefined ? null : Number(guide_id)
    if (gid !== null && !Number.isInteger(gid)) return res.status(400).json({ error: 'guía inválido' })
    try {
      if (gid !== null) {
        const g = await q('SELECT id FROM guides WHERE id = ? AND is_active = 1', [gid])
        if (!g.length) return res.status(404).json({ error: 'Guía no encontrado' })
      }
      const r = await q('UPDATE bookings_pipeline SET guide_id = ? WHERE booking_uuid = ?', [gid, booking_uuid])
      if (!r.affectedRows) return res.status(404).json({ error: 'Reserva no encontrada' })
      let confirmation = null
      if (gid !== null) {
        const [b] = await q('SELECT status FROM bookings_pipeline WHERE booking_uuid = ?', [booking_uuid])
        if (b && b.status === 'DEPOSIT_PAID') confirmation = await sendConfirmation(booking_uuid, { mode: 'auto' })
      }
      return res.status(200).json({
        success: true,
        confirmation: confirmation && confirmation.ok
          ? { sent: !!confirmation.sent, draftId: confirmation.draftId || null, review: confirmation.review || null }
          : null,
        status: confirmation && confirmation.ok && !confirmation.waiting ? 'CONFIRMED_ASSIGNED' : undefined,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Error al asignar el guía' })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}

export default withAdmin(handler)
