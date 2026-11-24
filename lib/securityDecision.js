import { db } from './mysql'
import { escapeHtml } from './html'

const ACTIONS = {
  approve: {
    status: 'SECURITY_APPROVED',
    button: '✅ Confirm approval',
    color: '#27ae60',
    question: 'Approve the security clearance for this booking?',
    doneTitle: '✅ Security Approved!',
    doneText: 'Thank you. The security clearance has been registered successfully.',
  },
  reject: {
    status: 'SECURITY_REJECTED',
    button: '❌ Confirm rejection',
    color: '#e74c3c',
    question: 'Reject this booking (or mark it as missing data)?',
    doneTitle: '❌ Security Rejected',
    doneText: 'The security clearance has been marked as rejected or missing data. The operations team has been notified.',
  },
}

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Security clearance</title></head>
<body><div style="text-align: center; font-family: Arial; margin: 100px 16px 0; color: #333;">${body}</div></body></html>`

const send = (res, code, body) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.status(code).send(page(body))
}

const invalid = (res) =>
  send(res, 404, `<h1>Link not valid</h1><p>This link is invalid or the booking was already processed.</p>`)

// GET: muestra un botón de confirmación (los antivirus de mail abren los links con GET y no deben cambiar nada).
// POST: valida token + estado y recién ahí cambia la reserva.
export function securityDecisionHandler(action) {
  const cfg = ACTIONS[action]

  return async function handler(req, res) {
    const params = req.method === 'POST' ? req.body || {} : req.query || {}
    const id = String(params.id || '')
    const token = String(params.token || '')
    if (!id || !token) return invalid(res)

    try {
      if (req.method === 'GET') {
        const [rows] = await db.promise().query(
          `SELECT client_name, destination_name FROM bookings_pipeline
            WHERE booking_uuid = ? AND security_token = ? AND status = 'SECURITY_DOCS_RECEIVED'`,
          [id, token]
        )
        if (rows.length === 0) return invalid(res)
        return send(res, 200, `
          <h2>${cfg.question}</h2>
          <p><b>${escapeHtml(rows[0].client_name)}</b> – ${escapeHtml(String(rows[0].destination_name).trim())}</p>
          <form method="POST" style="margin-top: 30px;">
            <input type="hidden" name="id" value="${escapeHtml(id)}">
            <input type="hidden" name="token" value="${escapeHtml(token)}">
            <button type="submit" style="background-color: ${cfg.color}; color: white; padding: 15px 25px; border: none; border-radius: 5px; font-weight: bold; font-size: 16px; cursor: pointer;">${cfg.button}</button>
          </form>`)
      }

      if (req.method === 'POST') {
        const [result] = await db.promise().query(
          `UPDATE bookings_pipeline SET status = ?, security_token = NULL
            WHERE booking_uuid = ? AND security_token = ? AND status = 'SECURITY_DOCS_RECEIVED'`,
          [cfg.status, id, token]
        )
        if (!result || result.affectedRows === 0) return invalid(res)
        return send(res, 200, `<h1 style="color: ${cfg.color};">${cfg.doneTitle}</h1><p>${cfg.doneText}</p><p style="color: #7f8c8d; font-size: 14px;">You can close this window now.</p>`)
      }

      res.setHeader('Allow', 'GET, POST')
      return res.status(405).send('Method Not Allowed')
    } catch (error) {
      console.error(`Error en security/${action}:`, error)
      return res.status(500).send('Internal Server Error')
    }
  }
}
