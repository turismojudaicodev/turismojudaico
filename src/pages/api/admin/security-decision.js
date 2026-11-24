import { db } from '../../../../lib/mysql'
import { POLICIES } from '../../../../lib/securityPolicy'

// Destinos con formulario externo (ej. Panamá): la comunidad aprueba/rechaza por su cuenta
// y el empleado registra la decisión desde el panel.
const DECISIONS = { approve: 'SECURITY_APPROVED', reject: 'SECURITY_REJECTED' }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { booking_uuid, decision } = req.body || {}
  const newStatus = DECISIONS[decision]
  if (!booking_uuid || !newStatus) return res.status(400).json({ error: 'Faltan booking_uuid o decision (approve | reject)' })

  try {
    const [rows] = await db.promise().query(
      'SELECT status, security_policy_applied FROM bookings_pipeline WHERE booking_uuid = ?',
      [booking_uuid]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' })
    const { status, security_policy_applied: policy } = rows[0]
    if (policy !== POLICIES.EXTERNAL_FORM) {
      return res.status(409).json({ error: 'Esta reserva no usa formulario externo: la decisión la toma el guía desde su mail.' })
    }
    if (status !== 'SECURITY_DOCS_RECEIVED') {
      return res.status(409).json({ error: `La reserva está en ${status}; el cliente todavía no completó el formulario de viaje o ya se decidió.` })
    }

    await db.promise().query(
      `UPDATE bookings_pipeline SET status = ? WHERE booking_uuid = ? AND status = 'SECURITY_DOCS_RECEIVED'`,
      [newStatus, booking_uuid]
    )
    return res.status(200).json({ success: true, status: newStatus })
  } catch (error) {
    console.error('Error registrando la decisión de seguridad:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
