// Botón "🔄 Actualizar planilla": completa comisiones de Stripe que falten y reescribe en la planilla
// todas las reservas con pagos. Es idempotente (no duplica filas) y no toca las columnas manuales.
import { withAdmin } from '../../../../lib/session'
import { db } from '../../../../lib/mysql'
import { getStripeFee } from '../../../../lib/stripe'
import { sheetsConfigured, syncBookingsToSheet } from '../../../../lib/sheets'

const q = async (sql, params = []) => (await db.promise().query(sql, params))[0]

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  if (!sheetsConfigured()) {
    return res.status(409).json({ error: 'La planilla no está configurada (faltan GOOGLE_SHEETS_ID y GOOGLE_SHEETS_REFRESH_TOKEN)' })
  }

  try {
    // 1. Comisiones de Stripe que todavía no se conocían.
    let fees = 0
    const stripePaid = await q("SELECT * FROM booking_payments WHERE method = 'STRIPE' AND status = 'CONFIRMED'", [])
    for (const p of stripePaid.filter((x) => x.fee_usd == null && x.stripe_payment_intent)) {
      try {
        const fee = await getStripeFee(p.stripe_payment_intent)
        if (fee != null) {
          await q('UPDATE booking_payments SET fee_usd = ? WHERE id = ?', [fee, p.id])
          fees++
        }
      } catch (error) {
        console.error('Planilla: no se pudo leer la comisión del pago', p.id, error?.message || error)
      }
    }

    // 2. Todas las reservas con pagos.
    const confirmed = await q("SELECT booking_uuid FROM booking_payments WHERE status = 'CONFIRMED'", [])
    const refunded = await q("SELECT booking_uuid FROM booking_payments WHERE status = 'REFUNDED'", [])
    const uuids = [...new Set([...confirmed, ...refunded].map((r) => r.booking_uuid))]

    // Una sola pasada para todas (Google limita la cantidad de llamadas por minuto).
    const r = await syncBookingsToSheet(uuids)
    return res.status(200).json({
      success: true,
      bookings: uuids.length,
      rows: r.written || 0,
      fees,
      errors: [],
      url: `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_ID}`,
    })
  } catch (error) {
    console.error('Planilla: error general', error)
    return res.status(500).json({ error: 'No se pudo actualizar la planilla' })
  }
}

export default withAdmin(handler)
