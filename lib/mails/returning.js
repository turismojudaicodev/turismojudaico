// Cliente que repite: ya tiene otra reserva con la seña paga (o el tour hecho) con el mismo email.
// Se le manda el texto "Happy to hear from you again" y tiene 10% de descuento.
import { db } from '../mysql'

export const RETURNING_DISCOUNT = 0.1
const DONE_STATUSES = ['DEPOSIT_PAID', 'CONFIRMED_ASSIGNED', 'COMPLETED']

export async function isReturningCustomer(email, excludeUuid = null) {
  const e = String(email || '').trim().toLowerCase()
  if (!e) return false
  const [rows] = await db.promise().query(
    `SELECT 1 FROM bookings_pipeline
      WHERE LOWER(TRIM(client_email)) = ? AND status IN (${DONE_STATUSES.map(() => '?').join(', ')})
        AND (? IS NULL OR booking_uuid <> ?)
      LIMIT 1`,
    [e, ...DONE_STATUSES, excludeUuid, excludeUuid]
  )
  return rows.length > 0
}

/** Total con el descuento de cliente que repite (redondeado a 2 decimales). */
export const withReturningDiscount = (total) => Math.round(Number(total) * (1 - RETURNING_DISCOUNT) * 100) / 100
