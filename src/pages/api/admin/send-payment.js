import { query } from '../../../../lib/mysql'
import { BOOKING_STATUS, getBookingByUuid } from '../../../../lib/bookings'
import { sendDirectEmail, createDraftEmail, withBookingRef } from '../../../../lib/gmail'
import { calculateBookingPrice } from '../../../../lib/pricing'
import { escapeHtml } from '../../../../lib/html'

// TODO: reemplazar por el link de Stripe Checkout cuando esté la integración de pagos.
const PAYMENT_LINK = 'LINK_DE_PAYPAL_O_STRIPE_AQUI'

const PAYABLE_STATUSES = [
  BOOKING_STATUS.PENDING_SECURITY_VETTING,
  BOOKING_STATUS.SECURITY_DOCS_RECEIVED,
  BOOKING_STATUS.SECURITY_APPROVED,
]

function buildPaymentEmail(booking, tourOption, pricing) {
  const name = escapeHtml(booking.client_name)
  const destination = escapeHtml(booking.destination_name)
  const intro =
    booking.status === BOOKING_STATUS.SECURITY_APPROVED
      ? `Great news! Your security profile has been approved by the local community in ${destination}. We are ready to proceed with your booking.`
      : `We are ready to proceed with your booking in ${destination}.`

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2c3e50;">Jewish Tours - Payment Details</h2>
      <p>Dear ${name},</p>
      <p>${intro}</p>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ddd;">
        <h3 style="margin-top: 0; color: #2980b9;">Booking Summary</h3>
        <p><b>Tour Option:</b> ${escapeHtml(tourOption)}</p>
        <p><b>Passengers:</b> ${pricing.pax}</p>
        <hr style="border: 0; border-top: 1px solid #ccc;" />
        <p><b>Base Tour Cost:</b> $${pricing.baseTotal} USD</p>
        ${pricing.extrasTotal > 0 ? `<p><b>Extra Services Requested:</b> $${pricing.extrasTotal} USD</p>` : ''}
        <h3 style="margin-bottom: 0; color: #27ae60;">Total to Pay: $${pricing.finalTotal} USD</h3>
      </div>

      <p>To confirm your reservation and secure your guide, please complete your payment using our secure link below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${PAYMENT_LINK}" style="background-color: #27ae60; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          💳 Proceed to Payment
        </a>
      </div>

      <p>If you have any questions or need to adjust your itinerary, please reply to this email.</p>
      <p>Best regards,<br><b>Judaic Tourism Operations</b></p>
    </div>`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { uuid, mode = 'draft' } = req.body

  try {
    const booking = await getBookingByUuid(uuid)
    if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' })
    if (!PAYABLE_STATUSES.includes(booking.status)) {
      return res.status(409).json({ error: `No se puede cobrar una reserva en estado ${booking.status}` })
    }

    const [security = {}] = await query(
      'SELECT * FROM booking_security_details WHERE booking_uuid = ? ORDER BY id DESC LIMIT 1',
      [uuid]
    )
    const tourOption = security.tour_type || booking.tour_option
    const pricing = calculateBookingPrice({ ...security, ...booking, tour_option: tourOption })

    if (!pricing.isPriced) {
      return res.status(422).json({
        error: `No hay tarifa para "${booking.destination_name}" / "${tourOption}". Revisá lib/pricing.js.`,
      })
    }

    const subject = `Payment Details for your Jewish Tour in ${booking.destination_name}`
    const html = withBookingRef(buildPaymentEmail(booking, tourOption, pricing), uuid)

    let draftId = null
    if (mode === 'direct') {
      await sendDirectEmail(booking.client_email, subject, html)
    } else {
      draftId = await createDraftEmail(booking.client_email, subject, html)
    }

    await query(
      `UPDATE bookings_pipeline
       SET status = ?, total_price_usd = ?, gmail_draft_id = COALESCE(?, gmail_draft_id)
       WHERE booking_uuid = ?`,
      [BOOKING_STATUS.PENDING_DEPOSIT, pricing.finalTotal, draftId, uuid]
    )

    return res.status(200).json({ success: true, draftId, total: pricing.finalTotal })
  } catch (error) {
    console.error('Error generando el mail de pago:', error)
    return res.status(500).json({ error: 'Error interno del servidor al procesar el pago' })
  }
}
