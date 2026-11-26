import Stripe from 'stripe'

let client

/** Cliente de Stripe, o null si falta STRIPE_SECRET_KEY. */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  client ??= new Stripe(key)
  return client
}

export const toCents = (usd) => Math.round(Number(usd) * 100)
export const fromCents = (cents) => Math.round(Number(cents)) / 100

/**
 * Comisión real que cobró Stripe por un pago (USD), leída de la transacción de balance.
 * Devuelve null si todavía no está disponible (se reintenta al actualizar la planilla).
 */
export async function getStripeFee(paymentIntentId) {
  const stripe = getStripe()
  if (!stripe || !paymentIntentId) return null
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge.balance_transaction'] })
  const bt = pi?.latest_charge?.balance_transaction
  if (!bt || typeof bt !== 'object' || typeof bt.fee !== 'number') return null
  return fromCents(bt.fee)
}
