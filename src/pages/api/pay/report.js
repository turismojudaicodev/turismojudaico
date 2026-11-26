// Acciones del cliente en /pay/<uuid> que no son Stripe:
// - zelle: informa una transferencia (queda REPORTED hasta que la verifiquen en el panel).
// - cash:  elige pagar el saldo en efectivo al guía el día del tour (la seña igual se paga antes).
import { PAYABLE_STATUSES, getBookingForPayment, getPayments, insertPayment, optionFor, paymentSummary } from '../../../../lib/payments'
import { db } from '../../../../lib/mysql'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_OPEN_REPORTS = 3

const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\r\n\t]+/g, ' ').trim().slice(0, max) : '')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { booking_uuid, action } = req.body || {}
  if (typeof booking_uuid !== 'string' || !UUID_RE.test(booking_uuid)) return res.status(400).json({ error: 'Invalid booking' })

  try {
    const booking = await getBookingForPayment(booking_uuid)
    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    if (!PAYABLE_STATUSES.includes(booking.status)) return res.status(409).json({ error: 'This booking is not open for payment' })

    const payments = await getPayments(booking_uuid)
    const summary = paymentSummary(booking, payments)

    if (action === 'zelle') {
      const option = optionFor(summary, req.body.kind)
      if (!option) return res.status(409).json({ error: 'This payment option is not available for your booking' })
      const payerName = clean(req.body.payer_name, 150)
      const reference = clean(req.body.reference, 100)
      if (!payerName) return res.status(400).json({ error: 'Please enter the name on the Zelle account you paid from' })
      if (payments.filter((p) => p.status === 'REPORTED').length >= MAX_OPEN_REPORTS) {
        return res.status(429).json({ error: 'We already have your Zelle payment report. Our team will confirm it shortly.' })
      }
      await insertPayment({
        booking_uuid,
        kind: option.kind,
        method: 'ZELLE',
        amount_usd: option.amount,
        status: 'REPORTED',
        payer_name: payerName,
        reference: reference || null,
      })
      return res.status(200).json({ success: true, amount: option.amount })
    }

    if (action === 'cash') {
      if (summary.balance <= 0) return res.status(409).json({ error: 'Your booking is already fully paid' })
      await db.promise().query("UPDATE bookings_pipeline SET payment_method = 'CASH' WHERE booking_uuid = ?", [booking_uuid])
      return res.status(200).json({ success: true, depositPaid: summary.depositPaid })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    console.error('Pay report: error', error)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
