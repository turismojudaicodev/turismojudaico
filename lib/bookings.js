import { query } from './mysql'

export const BOOKING_STATUS = {
  INQUIRY_RECEIVED: 'INQUIRY_RECEIVED',
  PENDING_SECURITY_VETTING: 'PENDING_SECURITY_VETTING',
  SECURITY_DOCS_RECEIVED: 'SECURITY_DOCS_RECEIVED',
  SECURITY_APPROVED: 'SECURITY_APPROVED',
  SECURITY_REJECTED: 'SECURITY_REJECTED',
  PENDING_DEPOSIT: 'PENDING_DEPOSIT',
  CONFIRMED_ASSIGNED: 'CONFIRMED_ASSIGNED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}

/** Estados en los que el cliente todavía puede completar el formulario de seguridad. */
export const SECURITY_FORM_OPEN_STATUSES = [
  BOOKING_STATUS.INQUIRY_RECEIVED,
  BOOKING_STATUS.PENDING_SECURITY_VETTING,
]

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

export function getSecurityFormUrl(uuid) {
  return `${getBaseUrl()}/security/${uuid}`
}

export async function getBookingByUuid(uuid) {
  if (!uuid) return null
  const rows = await query('SELECT * FROM bookings_pipeline WHERE booking_uuid = ?', [uuid])
  return rows[0] ?? null
}

export async function getBookingById(id) {
  if (!id) return null
  const rows = await query('SELECT * FROM bookings_pipeline WHERE id = ?', [id])
  return rows[0] ?? null
}
