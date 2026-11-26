// Reglas de cobro: seña fija de USD 50 para confirmar y saldo 14 días antes del tour.
// Métodos: Stripe (automático por webhook), Zelle (el cliente lo informa y se verifica en el panel)
// y efectivo (el saldo se le paga al guía el día del tour).
import { db } from './mysql'

export const DEPOSIT_USD = 50
export const BALANCE_DAYS_BEFORE = 14

export const METHODS = ['STRIPE', 'ZELLE', 'CASH']
export const KINDS = ['DEPOSIT', 'BALANCE', 'FULL', 'OTHER']

// Estados en los que ya se puede cobrar (después de seguridad).
export const PAYABLE_STATUSES = ['PENDING_DEPOSIT', 'DEPOSIT_PAID', 'CONFIRMED_ASSIGNED']

const q = async (sql, params = []) => (await db.promise().query(sql, params))[0]

const round2 = (n) => Math.round(Number(n || 0) * 100) / 100

/** YYYY-MM-DD de un DATE de MySQL (puede venir como Date o como texto). */
export function isoDate(value) {
  if (!value) return null
  if (value instanceof Date) {
    const y = value.getFullYear()
    const m = String(value.getMonth() + 1).padStart(2, '0')
    const d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return String(value).slice(0, 10)
}

/** Fecha límite del saldo: 14 días antes del tour (YYYY-MM-DD). */
export function balanceDueDate(tourDate) {
  const iso = isoDate(tourDate)
  if (!iso) return null
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - BALANCE_DAYS_BEFORE)
  return d.toISOString().slice(0, 10)
}

/**
 * Estado de cuenta de una reserva a partir de sus pagos.
 * `today` (YYYY-MM-DD) se puede pasar para las pruebas.
 */
export function paymentSummary(booking, payments = [], today = new Date().toISOString().slice(0, 10)) {
  const total = round2(booking.total_price_usd)
  const confirmed = payments.filter((p) => p.status === 'CONFIRMED')
  const paid = round2(confirmed.reduce((s, p) => s + Number(p.amount_usd), 0))
  const reported = round2(payments.filter((p) => p.status === 'REPORTED').reduce((s, p) => s + Number(p.amount_usd), 0))
  const balance = round2(Math.max(total - paid, 0))
  const depositTarget = round2(Math.min(DEPOSIT_USD, total))
  const depositPaid = total > 0 && paid >= depositTarget
  const dueDate = balanceDueDate(booking.tour_date)
  // Si ya pasó la fecha del saldo (faltan menos de 14 días), hay que pagar todo junto.
  const fullRequired = !!dueDate && today >= dueDate

  // Montos que la página de pago puede ofrecer. El servidor siempre calcula el monto: nunca viene del cliente.
  const options = []
  if (total > 0 && balance > 0) {
    if (!depositPaid) {
      if (!fullRequired) options.push({ kind: 'DEPOSIT', amount: round2(depositTarget - paid) })
      options.push({ kind: 'FULL', amount: balance })
    } else {
      options.push({ kind: 'BALANCE', amount: balance })
    }
  }

  return {
    total,
    paid,
    reported,
    balance,
    deposit: depositTarget,
    depositPaid,
    balanceDueDate: dueDate,
    fullRequired,
    fullyPaid: total > 0 && balance === 0,
    options,
    balanceMethod: booking.payment_method || null,
  }
}

export function optionFor(summary, kind) {
  return summary.options.find((o) => o.kind === kind) || null
}

export async function getBookingForPayment(uuid) {
  const rows = await q('SELECT * FROM bookings_pipeline WHERE booking_uuid = ?', [uuid])
  return rows[0] || null
}

export async function getPayments(uuid) {
  return q('SELECT * FROM booking_payments WHERE booking_uuid = ? ORDER BY id ASC', [uuid])
}

/**
 * Recalcula lo pagado y avanza el estado: PENDING_DEPOSIT -> DEPOSIT_PAID cuando entra la seña.
 * Es idempotente; se llama después de cada cambio en los pagos.
 * Devuelve { summary, depositJustPaid }.
 */
export async function syncBookingPayments(uuid) {
  const booking = await getBookingForPayment(uuid)
  if (!booking) return { summary: null, depositJustPaid: false }
  const payments = await getPayments(uuid)
  const summary = paymentSummary(booking, payments)

  await q('UPDATE bookings_pipeline SET deposit_paid_usd = ? WHERE booking_uuid = ?', [summary.paid, uuid])

  let depositJustPaid = false
  if (summary.depositPaid && booking.status === 'PENDING_DEPOSIT') {
    const r = await q("UPDATE bookings_pipeline SET status = 'DEPOSIT_PAID' WHERE booking_uuid = ? AND status = 'PENDING_DEPOSIT'", [uuid])
    depositJustPaid = r.affectedRows === 1
  }
  return { summary, depositJustPaid, booking: { ...booking, deposit_paid_usd: summary.paid } }
}

/** Registra un pago. Devuelve el id insertado. */
export async function insertPayment(p) {
  const r = await q(
    `INSERT INTO booking_payments (booking_uuid, kind, method, amount_usd, status, stripe_session_id, reference, payer_name, notes, confirmed_by, confirmed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      p.booking_uuid,
      p.kind,
      p.method,
      round2(p.amount_usd),
      p.status,
      p.stripe_session_id ?? null,
      p.reference ?? null,
      p.payer_name ?? null,
      p.notes ?? null,
      p.confirmed_by ?? null,
      p.status === 'CONFIRMED' ? new Date() : null,
    ]
  )
  return r.insertId
}
