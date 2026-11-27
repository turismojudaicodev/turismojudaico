// Reglas de cobro (definidas el 27/11/2026, iguales a las plantillas de mails del equipo):
// - Seña: 50% del total para confirmar. Panamá: 100% por adelantado.
// - Saldo: en Buenos Aires, Chile (Santiago), Lima y Río se paga en efectivo al guía el día del tour
//   (si el cliente lo pide, también online). En el resto de los destinos, online hasta 15 días antes.
// - Con tarjeta (Stripe) se suma un 5% de recargo. Zelle y efectivo pagan el monto exacto.
// Métodos: Stripe (automático por webhook), Zelle (el cliente lo informa y se verifica en el panel) y efectivo.
import { db } from './mysql'

export const DEPOSIT_RATIO = 0.5
export const BALANCE_DAYS_BEFORE = 15
export const CARD_SURCHARGE = 0.05

// Destinos según cómo se cobra el saldo (se compara sin acentos ni mayúsculas).
const CASH_BALANCE_CITIES = ['buenos aires', 'santiago', 'lima', 'rio de janeiro']
const FULL_UPFRONT_CITIES = ['panama']

const norm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

/**
 * Cómo se cobra un destino.
 * upfront: 'DEPOSIT' (seña del 50%) o 'FULL' (todo por adelantado).
 * balance: 'CASH' (efectivo al guía), 'ONLINE' (hasta 15 días antes) o null (no queda saldo).
 */
export function paymentPlan(destinationName) {
  const d = norm(destinationName)
  if (FULL_UPFRONT_CITIES.some((c) => d.includes(c))) return { upfront: 'FULL', balance: null }
  if (CASH_BALANCE_CITIES.some((c) => d.includes(c))) return { upfront: 'DEPOSIT', balance: 'CASH' }
  return { upfront: 'DEPOSIT', balance: 'ONLINE' }
}

/** Monto con el recargo de tarjeta. */
export const withCardSurcharge = (amount) => round2(Number(amount) * (1 + CARD_SURCHARGE))

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

/** Fecha límite del saldo online: 15 días antes del tour (YYYY-MM-DD). */
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
  const plan = paymentPlan(booking.destination_name)
  const confirmed = payments.filter((p) => p.status === 'CONFIRMED')
  const paid = round2(confirmed.reduce((s, p) => s + Number(p.amount_usd), 0))
  const reported = round2(payments.filter((p) => p.status === 'REPORTED').reduce((s, p) => s + Number(p.amount_usd), 0))
  const balance = round2(Math.max(total - paid, 0))
  const depositTarget = plan.upfront === 'FULL' ? total : round2(total * DEPOSIT_RATIO)
  const depositPaid = total > 0 && paid >= depositTarget
  // El saldo en efectivo no tiene fecha límite (se paga el día del tour).
  const dueDate = plan.balance === 'ONLINE' ? balanceDueDate(booking.tour_date) : null
  // Hay que pagar todo junto si el destino lo exige (Panamá) o si ya pasó la fecha del saldo online.
  const fullRequired = plan.upfront === 'FULL' || (!!dueDate && today >= dueDate)

  // Montos que la página de pago puede ofrecer. El servidor siempre calcula el monto: nunca viene del cliente.
  // cardAmount = lo que se cobra con tarjeta (con el 5% de recargo).
  const options = []
  const option = (kind, amount) => ({ kind, amount, cardAmount: withCardSurcharge(amount), surcharge: round2(withCardSurcharge(amount) - amount) })
  if (total > 0 && balance > 0) {
    if (!depositPaid) {
      if (!fullRequired) options.push(option('DEPOSIT', round2(depositTarget - paid)))
      options.push(option('FULL', balance))
    } else {
      options.push(option('BALANCE', balance))
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
    plan,
    cardSurchargePct: CARD_SURCHARGE * 100,
    // Cómo se paga el saldo: efectivo si el destino es de efectivo o si el cliente lo eligió.
    balanceMethod: booking.payment_method || (plan.balance === 'CASH' ? 'CASH' : null),
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
    `INSERT INTO booking_payments (booking_uuid, kind, method, amount_usd, surcharge_usd, status, stripe_session_id, reference, payer_name, notes, confirmed_by, confirmed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      p.booking_uuid,
      p.kind,
      p.method,
      round2(p.amount_usd),
      p.surcharge_usd == null ? null : round2(p.surcharge_usd),
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
