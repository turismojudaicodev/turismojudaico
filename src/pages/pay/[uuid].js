import { useState } from 'react';
import { PAYABLE_STATUSES, getBookingForPayment, getPayments, isoDate, paymentSummary } from '../../../lib/payments';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const KIND_LABEL = { DEPOSIT: 'Deposit', BALANCE: 'Remaining balance', FULL: 'Full amount' };

function formatDate(iso) {
  if (!iso) return '';
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export async function getServerSideProps(context) {
  const uuid = String(context.params.uuid || '').trim();
  if (!UUID_RE.test(uuid)) return { notFound: true };

  const booking = await getBookingForPayment(uuid);
  if (!booking) return { notFound: true };
  const payments = await getPayments(uuid);
  const summary = paymentSummary(booking, payments);

  return {
    props: {
      uuid,
      // Solo lo mínimo: cualquiera con el link ve esta página.
      firstName: String(booking.client_name || '').trim().split(/\s+/)[0] || '',
      destination: String(booking.destination_name || '').trim(),
      tourDate: isoDate(booking.tour_date),
      open: PAYABLE_STATUSES.includes(booking.status),
      summary,
      zelleReported: payments.some((p) => p.status === 'REPORTED'),
      stripeEnabled: !!process.env.STRIPE_SECRET_KEY,
      zelle: {
        recipient: process.env.ZELLE_RECIPIENT || '',
        name: process.env.ZELLE_RECIPIENT_NAME || 'Turismo Judaico',
      },
      result: ['success', 'cancelled'].includes(context.query.result) ? context.query.result : null,
    },
  };
}

const box = { padding: '15px', border: '1px solid #ddd', borderRadius: '6px', margin: '15px 0' };
const btn = (bg) => ({ background: bg, color: 'white', border: 0, padding: '12px 20px', borderRadius: '5px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' });

export default function PayPage({ uuid, firstName, destination, tourDate, open, summary, zelleReported, stripeEnabled, zelle, result }) {
  const [kind, setKind] = useState(summary.options[0]?.kind || null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(zelleReported ? 'zelle' : null);
  const option = summary.options.find((o) => o.kind === kind);
  const ref = `TJ-${uuid.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  async function post(url, body) {
    setBusy(true);
    setError('');
    try {
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ booking_uuid: uuid, ...body }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Something went wrong');
      return data;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function payCard() {
    const data = await post('/api/pay/checkout', { kind });
    if (data?.url) window.location.href = data.url;
  }

  async function reportZelle(ev) {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(ev.target));
    const data = await post('/api/pay/report', { action: 'zelle', kind, payer_name: f.payer_name, reference: f.reference });
    if (data) setDone('zelle');
  }

  async function chooseCash() {
    const data = await post('/api/pay/report', { action: 'cash' });
    if (data) setDone('cash');
  }

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 16px', fontFamily: 'Arial', color: '#333' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Jewish Tours - Payment</h2>
      <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
        {firstName ? `Hi ${firstName}! ` : ''}Your tour in <b>{destination}</b>
        {tourDate ? <> on <b>{formatDate(tourDate)}</b></> : null}
      </p>

      {result === 'success' && (
        <p role="status" style={{ ...box, borderColor: '#27ae60', background: '#eafaf1' }}>
          ✅ Thank you! Your card payment was received. You will get a confirmation email shortly.
        </p>
      )}
      {result === 'cancelled' && <p style={{ ...box, borderColor: '#f39c12', background: '#fef5e7' }}>The card payment was cancelled. You can try again below.</p>}

      <div style={{ ...box, background: '#f8f9fa' }}>
        <p style={{ margin: '4px 0' }}><b>Tour total:</b> ${summary.total} USD</p>
        <p style={{ margin: '4px 0' }}><b>Paid:</b> ${summary.paid} USD</p>
        {summary.balance > 0 && (
          <p style={{ margin: '4px 0' }}>
            <b>Remaining balance:</b> ${summary.balance} USD{summary.depositPaid && summary.balanceDueDate ? ` — due by ${formatDate(summary.balanceDueDate)}` : ''}
          </p>
        )}
      </div>

      {!open || summary.options.length === 0 ? (
        <p style={{ ...box, textAlign: 'center' }}>
          {summary.fullyPaid ? '✅ Your booking is fully paid. See you on the tour!' : 'There is nothing to pay right now. If you have questions, reply to our email.'}
        </p>
      ) : (
        <>
          <h3>1. What would you like to pay?</h3>
          {summary.options.map((o) => (
            <label key={o.kind} style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}>
              <input type="radio" name="kind" value={o.kind} checked={kind === o.kind} onChange={() => setKind(o.kind)} />{' '}
              <b>{KIND_LABEL[o.kind]}: ${o.amount} USD</b>
              {o.kind === 'DEPOSIT' && (
                <span style={{ color: '#7f8c8d' }}>
                  {summary.plan?.balance === 'CASH'
                    ? ' (confirms your booking; the rest is paid in cash to your guide on the day of the tour)'
                    : ' (confirms your booking; the rest is due 15 days before the tour)'}
                </span>
              )}
            </label>
          ))}
          {summary.fullRequired && !summary.depositPaid && (
            <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
              {summary.plan?.upfront === 'FULL'
                ? 'Tours in this destination are paid in full in advance.'
                : 'Your tour is less than 15 days away, so the full amount is due now.'}
            </p>
          )}

          <h3>2. How would you like to pay?</h3>
          {error && <p role="alert" style={{ color: '#c0392b', fontWeight: 'bold' }}>{error}</p>}

          {stripeEnabled && (
            <div style={box}>
              <h4 style={{ marginTop: 0 }}>💳 Credit / debit card</h4>
              <button type="button" onClick={payCard} disabled={busy || !option} style={btn('#27ae60')}>
                Pay ${option?.cardAmount} USD by card
              </button>
              <p style={{ fontSize: '12px', color: '#7f8c8d' }}>
                Includes a {summary.cardSurchargePct}% card fee (${option?.surcharge} USD). Zelle has no fee. Secure payment processed by Stripe.
              </p>
            </div>
          )}

          <div style={box}>
            <h4 style={{ marginTop: 0 }}>🏦 Zelle</h4>
            {done === 'zelle' ? (
              <p style={{ color: '#27ae60' }}>✅ Thanks! We received your Zelle report. Our team will confirm it within 1 business day.</p>
            ) : zelle.recipient ? (
              <>
                <p style={{ margin: '4px 0' }}>Send <b>${option?.amount} USD</b> to <b>{zelle.recipient}</b> ({zelle.name}).</p>
                <p style={{ margin: '4px 0' }}>Please write <b>{ref}</b> in the Zelle memo.</p>
                <p style={{ margin: '4px 0 10px' }}>Then let us know below so we can match it, especially if the Zelle account is under a different name:</p>
                <form onSubmit={reportZelle} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input name="payer_name" required maxLength={150} placeholder="Name on the Zelle account you paid from" className="form-control" />
                  <input name="reference" maxLength={100} placeholder="Zelle confirmation number (optional)" className="form-control" />
                  <button type="submit" disabled={busy || !option} style={btn('#6c3483')}>I sent ${option?.amount} USD by Zelle</button>
                </form>
              </>
            ) : (
              <p>Reply to our email and we will send you the Zelle details.</p>
            )}
          </div>

          {summary.plan?.balance === 'CASH' && summary.balance > (option?.kind === 'DEPOSIT' ? option.amount : 0) && (
            <div style={box}>
              <h4 style={{ marginTop: 0 }}>💵 Cash</h4>
              {done === 'cash' || summary.balanceMethod === 'CASH' ? (
                <p style={{ color: '#27ae60' }}>
                  ✅ Noted: you will pay the remaining balance in cash to your guide on the day of the tour.
                  {!summary.depositPaid && ' The deposit still needs to be paid by card or Zelle to confirm your booking.'}
                </p>
              ) : (
                <>
                  <p style={{ margin: '4px 0 10px' }}>
                    You can pay the <b>remaining balance</b> in cash (USD) to your guide on the day of the tour.
                    {!summary.depositPaid && ' The deposit must still be paid by card or Zelle to confirm your booking.'}
                  </p>
                  <button type="button" onClick={chooseCash} disabled={busy} style={btn('#2980b9')}>I will pay the balance in cash</button>
                </>
              )}
            </div>
          )}
        </>
      )}
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#95a5a6' }}>Ref: {uuid.replace(/-/g, '')}</p>
    </div>
  );
}
