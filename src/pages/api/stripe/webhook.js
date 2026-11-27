// Webhook de Stripe: confirma pagos, marca checkouts vencidos y registra reembolsos.
// Stripe reintenta los eventos, así que todo es idempotente (un pago confirmado no se vuelve a confirmar).
import { getStripe, fromCents, getStripeFee } from '../../../../lib/stripe'
import { syncBookingToSheetSafe } from '../../../../lib/sheets'
import { db } from '../../../../lib/mysql'
import { insertPayment, syncBookingPayments } from '../../../../lib/payments'
import { afterPaymentSynced } from '../../../../lib/voucher'

export const config = { api: { bodyParser: false } }

const q = async (sql, params = []) => (await db.promise().query(sql, params))[0]

async function readRawBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  return Buffer.concat(chunks)
}

async function confirmSession(session) {
  const uuid = session.metadata?.booking_uuid || session.client_reference_id
  if (!uuid) return 'sin reserva'
  // Lo cobrado incluye el 5% de recargo de tarjeta. Al saldo se acredita el monto base (metadata del checkout);
  // si el checkout se creó por fuera de la app (sin metadata), se acredita todo lo cobrado.
  const charged = fromCents(session.amount_total)
  const base = Number(session.metadata?.base_usd)
  const amount = Number.isFinite(base) && base > 0 && base <= charged ? base : charged
  const surcharge = Math.round((charged - amount) * 100) / 100
  const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null

  const rows = await q('SELECT * FROM booking_payments WHERE stripe_session_id = ?', [session.id])
  if (rows.length === 0) {
    // Checkout creado por fuera de /api/pay/checkout (por ejemplo desde el dashboard de Stripe).
    const exists = await q('SELECT booking_uuid FROM bookings_pipeline WHERE booking_uuid = ?', [uuid])
    if (exists.length === 0) return 'reserva inexistente'
    await insertPayment({
      booking_uuid: uuid,
      kind: ['DEPOSIT', 'BALANCE', 'FULL'].includes(session.metadata?.kind) ? session.metadata.kind : 'OTHER',
      method: 'STRIPE',
      amount_usd: amount,
      surcharge_usd: surcharge,
      status: 'CONFIRMED',
      stripe_session_id: session.id,
      confirmed_by: 'stripe-webhook',
    })
    if (paymentIntent) await q('UPDATE booking_payments SET stripe_payment_intent = ? WHERE stripe_session_id = ?', [paymentIntent, session.id])
  } else {
    const r = await q(
      "UPDATE booking_payments SET status = 'CONFIRMED', amount_usd = ?, surcharge_usd = ?, stripe_payment_intent = ?, confirmed_by = 'stripe-webhook', confirmed_at = ? WHERE stripe_session_id = ? AND status = 'PENDING'",
      [amount, surcharge, paymentIntent, new Date(), session.id]
    )
    if (r.affectedRows === 0) return 'ya procesado'
  }

  // Comisión real de Stripe (para la planilla). Si todavía no está, se completa al actualizar la planilla.
  try {
    const fee = await getStripeFee(paymentIntent)
    if (fee != null) await q('UPDATE booking_payments SET fee_usd = ? WHERE stripe_session_id = ?', [fee, session.id])
  } catch (error) {
    console.error('Webhook Stripe: no se pudo leer la comisión', error?.message || error)
  }

  const sync = await syncBookingPayments(uuid)
  const after = await afterPaymentSynced(sync, uuid)
  await syncBookingToSheetSafe(uuid)
  return after.voucher ? 'confirmado + voucher' : 'confirmado'
}

async function handleEvent(event) {
  const obj = event.data.object
  switch (event.type) {
    case 'checkout.session.completed':
      // Tarjeta: payment_status = 'paid'. Métodos lentos llegan después por async_payment_succeeded.
      return obj.payment_status === 'paid' ? confirmSession(obj) : 'esperando pago asíncrono'
    case 'checkout.session.async_payment_succeeded':
      return confirmSession(obj)
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      const r = await q("UPDATE booking_payments SET status = 'FAILED' WHERE stripe_session_id = ? AND status = 'PENDING'", [obj.id])
      return r.affectedRows ? 'marcado vencido/fallido' : 'sin cambios'
    }
    case 'charge.refunded': {
      // Solo reembolso total: un parcial queda registrado en Stripe y se ajusta a mano en el panel.
      if (!obj.refunded || !obj.payment_intent) return 'reembolso parcial: revisar a mano'
      const pi = typeof obj.payment_intent === 'string' ? obj.payment_intent : obj.payment_intent.id
      const rows = await q('SELECT booking_uuid FROM booking_payments WHERE stripe_payment_intent = ?', [pi])
      if (rows.length === 0) return 'pago no encontrado'
      await q("UPDATE booking_payments SET status = 'REFUNDED' WHERE stripe_payment_intent = ? AND status = 'CONFIRMED'", [pi])
      await syncBookingPayments(rows[0].booking_uuid)
      await syncBookingToSheetSafe(rows[0].booking_uuid)
      return 'reembolsado'
    }
    default:
      return 'ignorado'
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    console.error('Webhook Stripe: falta STRIPE_SECRET_KEY o STRIPE_WEBHOOK_SECRET')
    return res.status(500).json({ error: 'Webhook not configured' })
  }

  let event
  try {
    const raw = await readRawBody(req)
    event = stripe.webhooks.constructEvent(raw, req.headers['stripe-signature'], secret)
  } catch (error) {
    // Firma inválida: no viene de Stripe (o el secreto no coincide).
    return res.status(400).json({ error: 'Invalid signature' })
  }

  try {
    const result = await handleEvent(event)
    return res.status(200).json({ received: true, result })
  } catch (error) {
    // 500 hace que Stripe reintente más tarde.
    console.error(`Webhook Stripe: error procesando ${event.type} (${event.id})`, error)
    return res.status(500).json({ error: 'Processing error' })
  }
}
