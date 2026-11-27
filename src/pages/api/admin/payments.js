// Pagos desde el panel.
// GET  ?booking_uuid=…                         -> { payments, summary }
// POST { action: 'confirm', payment_id }       -> Zelle informado -> confirmado (ya lo vieron en el banco)
// POST { action: 'reject', payment_id }        -> Zelle informado -> no llegó
// POST { action: 'record', booking_uuid, method, kind, amount, reference?, payer_name?, notes? }
//                                              -> pago cargado a mano (efectivo, Zelle visto en el banco, etc.)
// Cuando la seña queda completa, la reserva pasa a "Seña recibida" y la confirmación sale sola (si ya hay guía elegido).
import { withAdmin } from '../../../../lib/session'
import { db } from '../../../../lib/mysql'
import { KINDS, METHODS, getBookingForPayment, getPayments, insertPayment, paymentSummary, syncBookingPayments } from '../../../../lib/payments'
import { afterPaymentSynced } from '../../../../lib/voucher'
import { syncBookingToSheetSafe } from '../../../../lib/sheets'

const q = async (sql, params = []) => (await db.promise().query(sql, params))[0]
const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\r\n\t]+/g, ' ').trim().slice(0, max) : '')

async function respondWithSync(res, uuid) {
  const sync = await syncBookingPayments(uuid)
  const after = await afterPaymentSynced(sync, uuid)
  const sheet = await syncBookingToSheetSafe(uuid)
  const booking = await getBookingForPayment(uuid)
  return res.status(200).json({
    success: true,
    status: booking?.status,
    summary: sync.summary,
    voucherDraft: after.voucher,
    voucherSent: !!after.sent,
    waitingGuide: !!after.waitingGuide,
    sheetError: !!sheet?.error,
  })
}

async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const uuid = String(req.query.booking_uuid || '')
      const booking = await getBookingForPayment(uuid)
      if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' })
      const payments = await getPayments(uuid)
      return res.status(200).json({ payments, summary: paymentSummary(booking, payments) })
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
    const body = req.body || {}
    const who = req.session?.username || 'admin'

    if (body.action === 'confirm' || body.action === 'reject') {
      const id = Number(body.payment_id)
      if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'payment_id inválido' })
      const rows = await q('SELECT * FROM booking_payments WHERE id = ?', [id])
      const payment = rows[0]
      if (!payment) return res.status(404).json({ error: 'Pago no encontrado' })
      if (payment.status !== 'REPORTED') return res.status(409).json({ error: `El pago está ${payment.status}, no "informado"` })

      if (body.action === 'confirm') {
        await q("UPDATE booking_payments SET status = 'CONFIRMED', confirmed_by = ?, confirmed_at = ? WHERE id = ? AND status = 'REPORTED'", [
          who,
          new Date(),
          id,
        ])
      } else {
        await q("UPDATE booking_payments SET status = 'FAILED', confirmed_by = ? WHERE id = ? AND status = 'REPORTED'", [who, id])
      }
      return respondWithSync(res, payment.booking_uuid)
    }

    if (body.action === 'record') {
      const uuid = String(body.booking_uuid || '')
      const booking = await getBookingForPayment(uuid)
      if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' })
      if (!METHODS.includes(body.method)) return res.status(400).json({ error: 'Método de pago inválido' })
      if (!KINDS.includes(body.kind)) return res.status(400).json({ error: 'Tipo de pago inválido' })
      const amount = Math.round(Number(body.amount) * 100) / 100
      if (!(amount > 0) || amount > 100000) return res.status(400).json({ error: 'Monto inválido' })
      if (['CANCELLED', 'SECURITY_REJECTED'].includes(booking.status)) {
        return res.status(409).json({ error: `La reserva está ${booking.status}` })
      }
      await insertPayment({
        booking_uuid: uuid,
        kind: body.kind,
        method: body.method,
        amount_usd: amount,
        status: 'CONFIRMED',
        reference: clean(body.reference, 255) || null,
        payer_name: clean(body.payer_name, 150) || null,
        notes: clean(body.notes, 1000) || null,
        confirmed_by: who,
      })
      return respondWithSync(res, uuid)
    }

    return res.status(400).json({ error: 'Acción inválida' })
  } catch (error) {
    console.error('Pagos admin: error', error)
    return res.status(500).json({ error: 'Error al procesar el pago' })
  }
}

export default withAdmin(handler)
