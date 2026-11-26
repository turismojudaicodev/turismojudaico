import { withAdmin } from '../../../../lib/session'
import { createVoucherDraft } from '../../../../lib/voucher'

// Botón "Armar Voucher" del panel. Normalmente no hace falta: cuando se registra la seña
// (Stripe, Zelle confirmado o pago cargado a mano) el voucher se arma solo.
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { booking_uuid } = req.body || {}
  if (!booking_uuid) return res.status(400).json({ error: 'Falta el uuid de la reserva' })

  try {
    const r = await createVoucherDraft(booking_uuid)
    if (!r.ok) return res.status(r.status).json({ error: r.error })
    return res.status(200).json({ success: true, draftId: r.draftId })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al generar el voucher' })
  }
}

export default withAdmin(handler)
