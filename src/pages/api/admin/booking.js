import { query } from '../../../../lib/mysql'
import { BOOKING_STATUS, getBookingById } from '../../../../lib/bookings'
import { findDraftByBookingId, sendExistingDraft } from '../../../../lib/gmail'

const VALID_STATUSES = Object.values(BOOKING_STATUS)

/** Envía el borrador con la info del tour que se creó al recibir la consulta. */
async function sendInquiryDraft(booking) {
  const draftId =
    booking.gmail_draft_id || (await findDraftByBookingId(booking.booking_uuid))?.draftId
  if (!draftId) return false
  return sendExistingDraft(draftId)
}

async function updateBooking(req, res) {
  const { id, status, client_name, client_email, destination_name, tour_date, pax_adults } = req.body

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Estado inválido: ${status}` })
  }

  const booking = await getBookingById(id)
  if (!booking) return res.status(404).json({ error: 'La reserva no existe.' })

  const isEdit = client_name !== undefined
  if (isEdit) {
    await query(
      `UPDATE bookings_pipeline
       SET client_name = ?, client_email = ?, destination_name = ?, tour_date = ?, pax_adults = ?, status = ?
       WHERE id = ?`,
      [client_name, client_email, destination_name, tour_date, pax_adults, status || booking.status, id]
    )
  } else {
    await query('UPDATE bookings_pipeline SET status = ? WHERE id = ?', [status, id])
  }

  // Al pasar de "Por responder" a "Seguridad" se le manda al cliente el borrador ya revisado.
  const movedToSecurity =
    booking.status === BOOKING_STATUS.INQUIRY_RECEIVED &&
    status === BOOKING_STATUS.PENDING_SECURITY_VETTING
  const draftSent = movedToSecurity ? await sendInquiryDraft(booking) : false

  return res.status(200).json({ success: true, draftSent })
}

async function deleteBooking(req, res) {
  const { id } = req.body
  if (!id) return res.status(400).json({ error: 'Falta el ID de la reserva' })

  const result = await query('DELETE FROM bookings_pipeline WHERE id = ?', [id])
  if (result.affectedRows === 0) return res.status(404).json({ error: 'La reserva no existe.' })

  return res.status(200).json({ success: true })
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const bookings = await query('SELECT * FROM bookings_pipeline ORDER BY created_at DESC')
      return res.status(200).json(bookings)
    }
    if (req.method === 'PUT') return await updateBooking(req, res)
    if (req.method === 'DELETE') return await deleteBooking(req, res)

    return res.status(405).json({ error: 'Método no permitido' })
  } catch (error) {
    console.error(`Error en ${req.method} /api/admin/booking:`, error)
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'El destino no existe en la configuración de destinos.' })
    }
    return res.status(500).json({ error: 'Error al procesar la reserva' })
  }
}
