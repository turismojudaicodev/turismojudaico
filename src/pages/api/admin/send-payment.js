import { withAdmin } from '../../../../lib/session'
import { db } from '../../../../lib/mysql';
import { sendDirectEmail, createDraftEmail, threadForBooking } from '../../../../lib/gmail';
import { calculateBookingPrice } from '../../../../lib/pricing';
import { refFooter } from '../../../../lib/html';
import { getPayments, paymentSummary } from '../../../../lib/payments';
import { paymentMail } from '../../../../lib/mails/index';
import { isReturningCustomer, withReturningDiscount } from '../../../../lib/mails/returning';

// El cobro se arma en la etapa de seguridad (el panel permite "Armar Cobro" sin esperar al guía)
// o para reenviarlo mientras se espera la seña. Nunca después de cobrar la seña, ni en canceladas/rechazadas.
const ALLOWED_STATUSES = ['PENDING_SECURITY_VETTING', 'SECURITY_DOCS_RECEIVED', 'SECURITY_APPROVED', 'PENDING_DEPOSIT'];


async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { uuid } = req.body || {};
  const mode = req.body?.mode === 'direct' ? 'direct' : 'draft';

  if (!uuid) {
    return res.status(400).json({ error: 'Falta el uuid de la reserva' });
  }

  try {
    // 1. Datos de la reserva + el último formulario de seguridad (tour elegido y extras)
    const [rows] = await db.promise().query(`
      SELECT
        bp.*,
        COALESCE(bsd.tour_type, bp.tour_option) AS tour_option,
        bsd.extra_amia, bsd.extra_airport, bsd.extra_port, bsd.extra_casapueblo, bsd.extra_callao
      FROM bookings_pipeline bp
      LEFT JOIN booking_security_details bsd ON bp.booking_uuid = bsd.booking_uuid
      WHERE bp.booking_uuid = ?
      ORDER BY bsd.id DESC
      LIMIT 1
    `, [uuid]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    const booking = rows[0];
    if (!ALLOWED_STATUSES.includes(booking.status)) {
      return res.status(409).json({ error: `La reserva está en ${booking.status}: no se puede armar el cobro en este estado` });
    }

    // 2. Calculamos el precio exacto usando tu motor de reglas
    const pricing = calculateBookingPrice(booking);
    if (!pricing.finalTotal) {
      return res.status(422).json({
        error: `No se pudo calcular el precio para "${String(booking.destination_name).trim()}" / "${booking.tour_option || 'sin opción de tour'}". Revisá el destino y la opción elegida (lib/pricing.js).`,
      });
    }

    // 3. Cliente que repite (otra reserva con seña paga, mismo email): 10% de descuento.
    const returning = await isReturningCustomer(booking.client_email, uuid);
    const total = returning ? withReturningDiscount(pricing.finalTotal) : pricing.finalTotal;

    // Mail con la plantilla del equipo (rta 2). Si ya hubo pagos (reenvío), se descuentan.
    const summary = paymentSummary({ ...booking, total_price_usd: total }, await getPayments(uuid));
    const depositNow = summary.options.find((o) => o.kind === 'DEPOSIT');
    const mail = paymentMail(booking, summary, { returning });
    const subject = mail.subject;
    const htmlBody = mail.html + refFooter(uuid);

    // 4. Ejecutamos la acción según el botón que tocaste (Borrador o Directo)
    //    Va como respuesta en el hilo de la reserva ("Re: Jewish Tour ..."), si lo encontramos en Gmail.
    const thread = await threadForBooking(uuid);
    let draftId = null;
    if (mode === 'direct') {
      await sendDirectEmail(booking.client_email, subject, htmlBody, '', thread);
    } else {
      draftId = await createDraftEmail(booking.client_email, subject, htmlBody, thread);
    }

    // 5. Estado "Esperando Pago" + total calculado (para finanzas)
    const sets = [`status = 'PENDING_DEPOSIT'`, `total_price_usd = ?`];
    const params = [total];
    if (draftId) {
      sets.push(`gmail_draft_id = ?`);
      params.push(draftId);
    }
    params.push(uuid);
    await db.promise().query(`UPDATE bookings_pipeline SET ${sets.join(', ')} WHERE booking_uuid = ?`, params);

    res.status(200).json({ success: true, draftId, total, returning, deposit: depositNow ? depositNow.amount : 0 });

  } catch (error) {
    console.error('🔥 Error generando el pago:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar el pago' });
  }
}

export default withAdmin(handler)
