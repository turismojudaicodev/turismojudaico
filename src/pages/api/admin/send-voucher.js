import { withAdmin } from '../../../../lib/session'
import { createVoucherDraft } from '../../../../lib/voucher'

// Botón "Armar Voucher" del panel. Normalmente no hace falta: con la seña registrada y el guía elegido,
// la confirmación sale sola. Sirve si falló Gmail. Si la plantilla no tiene el párrafo del guía, queda en borrador.
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { booking_uuid } = req.body || {}
  if (!booking_uuid) return res.status(400).json({ error: 'Falta el uuid de la reserva' })

  try {
    const r = await createVoucherDraft(booking_uuid)
    if (!r.ok) return res.status(r.status).json({ error: r.error })
    return res.status(200).json({ success: true, sent: r.sent, draftId: r.draftId, review: r.review })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al generar la confirmación' })
  }
}

export default withAdmin(handler)
