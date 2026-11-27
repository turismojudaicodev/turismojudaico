// Crea un Checkout de Stripe para la seña, el saldo o el total de una reserva.
// Es público (lo usa el cliente desde /pay/<uuid>). El monto lo calcula el servidor; del cliente solo se acepta el tipo.
// Con tarjeta se cobra el monto + 5% de recargo; en la base se guarda el monto (lo que descuenta del saldo) y el recargo aparte.
import { getStripe, toCents } from '../../../../lib/stripe'
import { PAYABLE_STATUSES, getBookingForPayment, getPayments, insertPayment, optionFor, paymentSummary } from '../../../../lib/payments'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const LABELS = { DEPOSIT: 'Deposit', BALANCE: 'Remaining balance', FULL: 'Full payment' }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { booking_uuid, kind } = req.body || {}
  if (typeof booking_uuid !== 'string' || !UUID_RE.test(booking_uuid)) return res.status(400).json({ error: 'Invalid booking' })
  if (!LABELS[kind]) return res.status(400).json({ error: 'Invalid payment type' })

  const stripe = getStripe()
  if (!stripe) return res.status(503).json({ error: 'Card payments are not available right now. Please use Zelle or contact us.' })

  try {
    const booking = await getBookingForPayment(booking_uuid)
    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    if (!PAYABLE_STATUSES.includes(booking.status)) return res.status(409).json({ error: 'This booking is not open for payment' })

    const summary = paymentSummary(booking, await getPayments(booking_uuid))
    const option = optionFor(summary, kind)
    if (!option) return res.status(409).json({ error: 'This payment option is not available for your booking' })

    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const destination = String(booking.destination_name).trim()
    const metadata = { booking_uuid, kind, base_usd: String(option.amount), surcharge_usd: String(option.surcharge) }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: toCents(option.cardAmount),
            product_data: {
              name: `${destination} — ${LABELS[kind]}`,
              description: `USD ${option.amount} + ${summary.cardSurchargePct}% card fee`,
            },
          },
        },
      ],
      customer_email: booking.client_email,
      client_reference_id: booking_uuid,
      metadata,
      payment_intent_data: { metadata },
      success_url: `${base}/pay/${booking_uuid}?result=success`,
      cancel_url: `${base}/pay/${booking_uuid}?result=cancelled`,
    })

    await insertPayment({
      booking_uuid,
      kind,
      method: 'STRIPE',
      amount_usd: option.amount,
      surcharge_usd: option.surcharge,
      status: 'PENDING',
      stripe_session_id: session.id,
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Checkout: error creando la sesión de Stripe', error)
    return res.status(500).json({ error: 'Could not start the card payment. Please try again.' })
  }
}
