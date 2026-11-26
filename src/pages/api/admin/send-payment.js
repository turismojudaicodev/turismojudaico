import { withAdmin } from '../../../../lib/session'
import { db } from '../../../../lib/mysql';
import { sendDirectEmail, createDraftEmail } from '../../../../lib/gmail';
import { calculateBookingPrice } from '../../../../lib/pricing';
import { escapeHtml, refFooter } from '../../../../lib/html';
import { POLICIES } from '../../../../lib/securityPolicy';
import { balanceDueDate, getPayments, paymentSummary } from '../../../../lib/payments';

// El cobro se arma en la etapa de seguridad (el panel permite "Armar Cobro" sin esperar al guía)
// o para reenviarlo mientras se espera la seña. Nunca después de cobrar la seña, ni en canceladas/rechazadas.
const ALLOWED_STATUSES = ['PENDING_SECURITY_VETTING', 'SECURITY_DOCS_RECEIVED', 'SECURITY_APPROVED', 'PENDING_DEPOSIT'];

const round = (n) => Math.round(n * 100) / 100;
const formatDate = (iso) =>
  iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) : '';

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
        bp.client_name,
        bp.client_email,
        bp.status,
        bp.tour_date,
        bp.destination_name,
        bp.pax_adults,
        bp.security_policy_applied,
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

    // 3. Armamos el diseño del correo
    const destination = escapeHtml(String(booking.destination_name).trim());
    const subject = `Payment Details for your Jewish Tour in ${String(booking.destination_name).trim()}`;
    const payHref = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pay/${uuid}`;
    // Si ya hubo pagos (reenvío), se descuentan del monto a pagar.
    const summary = paymentSummary({ ...booking, total_price_usd: pricing.finalTotal }, await getPayments(uuid));
    const dueDate = balanceDueDate(booking.tour_date);
    const depositNow = summary.options.find((o) => o.kind === 'DEPOSIT');
    const fullNow = summary.options.find((o) => o.kind === 'FULL');
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2c3e50;">Jewish Tours - Payment Details</h2>
        <p>Dear ${escapeHtml(booking.client_name)},</p>
        <p>${booking.security_policy_applied === POLICIES.NONE
          ? `Thank you for sending your trip details for ${destination}.`
          : `Great news! Your security profile has been approved by the local community in ${destination}.`} We are ready to proceed with your booking.</p>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ddd;">
          <h3 style="margin-top: 0; color: #2980b9;">Booking Summary</h3>
          <p><b>Tour Option:</b> ${escapeHtml(booking.tour_option)}</p>
          <p><b>Passengers:</b> ${pricing.pax}</p>
          <hr style="border: 0; border-top: 1px solid #ccc;" />
          <p><b>Base Tour Cost:</b> $${pricing.baseTotal} USD</p>
          ${pricing.extrasTotal > 0 ? `<p><b>Extra Services Requested:</b> $${pricing.extrasTotal} USD</p>` : ''}
          <h3 style="margin-bottom: 0; color: #27ae60;">Tour Total: $${pricing.finalTotal} USD</h3>
          ${summary.paid > 0 ? `<p style="margin: 4px 0 0;"><b>Already paid:</b> $${summary.paid} USD</p>` : ''}
        </div>

        ${depositNow
          ? `<p>To confirm your reservation and secure your guide, please pay a <b>deposit of $${depositNow.amount} USD</b>.
             The remaining balance of <b>$${round(summary.balance - depositNow.amount)} USD</b> is due by <b>${formatDate(dueDate)}</b>
             (2 weeks before the tour), online or in cash to your guide on the day of the tour.</p>`
          : `<p>Since your tour is less than 2 weeks away, please pay the <b>full amount of $${fullNow ? fullNow.amount : summary.balance} USD</b> to confirm your reservation.</p>`}
        <p>You can pay by <b>credit card</b> or <b>Zelle</b> on our secure payment page:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${payHref}" style="background-color: #27ae60; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            💳 Go to Payment Page
          </a>
        </div>

        <p>If you have any questions or need to adjust your itinerary, please reply to this email.</p>
        <p>Best regards,<br><b>Judaic Tourism Operations</b></p>
        ${refFooter(uuid)}
      </div>
    `;

    // 4. Ejecutamos la acción según el botón que tocaste (Borrador o Directo)
    let draftId = null;
    if (mode === 'direct') {
      await sendDirectEmail(booking.client_email, subject, htmlBody);
    } else {
      draftId = await createDraftEmail(booking.client_email, subject, htmlBody);
    }

    // 5. Estado "Esperando Pago" + total calculado (para finanzas)
    const sets = [`status = 'PENDING_DEPOSIT'`, `total_price_usd = ?`];
    const params = [pricing.finalTotal];
    if (draftId) {
      sets.push(`gmail_draft_id = ?`);
      params.push(draftId);
    }
    params.push(uuid);
    await db.promise().query(`UPDATE bookings_pipeline SET ${sets.join(', ')} WHERE booking_uuid = ?`, params);

    res.status(200).json({ success: true, draftId, total: pricing.finalTotal, deposit: depositNow ? depositNow.amount : 0 });

  } catch (error) {
    console.error('🔥 Error generando el pago:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar el pago' });
  }
}

export default withAdmin(handler)
