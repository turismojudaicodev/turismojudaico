import { query } from './mysql'
import { BOOKING_STATUS, getBookingByUuid } from './bookings'
import { escapeHtml } from './html'

const DECISIONS = {
  approve: {
    status: BOOKING_STATUS.SECURITY_APPROVED,
    color: '#27ae60',
    button: '✅ Confirm approval',
    done: '✅ Security Approved!',
    doneText: 'Thank you. The security clearance has been registered successfully.',
  },
  reject: {
    status: BOOKING_STATUS.SECURITY_REJECTED,
    color: '#e74c3c',
    button: '❌ Confirm rejection / missing data',
    done: '❌ Security Rejected',
    doneText: 'The security clearance has been marked as rejected or missing data. The operations team has been notified.',
  },
}

const page = (body) => `<!doctype html><html><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1"><title>Security review</title></head>
  <body style="text-align:center; font-family:Arial; margin-top:80px; color:#333; padding:0 16px;">${body}</body></html>`

function sendPage(res, status, body) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(status).send(page(body))
}

/**
 * Maneja los links de aprobación/rechazo que recibe el guía.
 * GET muestra un botón de confirmación y POST aplica el cambio. Así los antivirus
 * de mail, que abren los links automáticamente, no cambian el estado de la reserva.
 */
export async function handleSecurityDecision(req, res, decisionKey) {
  const decision = DECISIONS[decisionKey]
  const { id } = req.query

  try {
    const booking = await getBookingByUuid(id)
    if (!booking) return sendPage(res, 404, '<h1>Booking not found</h1>')

    if (booking.status === decision.status) {
      return sendPage(res, 200, `<h1 style="color:${decision.color}">${decision.done}</h1><p>This was already registered.</p>`)
    }
    if (booking.status !== BOOKING_STATUS.SECURITY_DOCS_RECEIVED) {
      return sendPage(res, 409, '<h1>This booking is not waiting for a security review.</h1>')
    }

    if (req.method === 'GET') {
      return sendPage(
        res,
        200,
        `<h1>Security review</h1>
         <p>Booking for <b>${escapeHtml(booking.client_name)}</b> in <b>${escapeHtml(booking.destination_name)}</b>.</p>
         <form method="POST">
           <button type="submit" style="background:${decision.color}; color:#fff; border:0; padding:15px 25px; border-radius:5px; font-size:16px; cursor:pointer;">
             ${decision.button}
           </button>
         </form>`
      )
    }
    if (req.method !== 'POST') return sendPage(res, 405, '<h1>Method not allowed</h1>')

    await query('UPDATE bookings_pipeline SET status = ? WHERE booking_uuid = ?', [decision.status, id])
    return sendPage(
      res,
      200,
      `<h1 style="color:${decision.color}">${decision.done}</h1><p>${decision.doneText}</p>
       <p style="color:#7f8c8d; font-size:14px;">You can close this window now.</p>`
    )
  } catch (error) {
    console.error(`Error en la revisión de seguridad (${decisionKey}):`, error)
    return sendPage(res, 500, '<h1>Internal Server Error</h1>')
  }
}
