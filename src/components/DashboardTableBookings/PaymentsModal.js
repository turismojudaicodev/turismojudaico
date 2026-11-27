import { useEffect, useState } from 'react'

const METHOD_LABEL = { STRIPE: '💳 Stripe', ZELLE: '🏦 Zelle', CASH: '💵 Efectivo' }
const KIND_LABEL = { DEPOSIT: 'Seña', BALANCE: 'Saldo', FULL: 'Total', OTHER: 'Otro' }
const STATUS_LABEL = {
  PENDING: '⏳ Checkout abierto',
  REPORTED: '🔔 Informado, verificar',
  CONFIRMED: '✅ Confirmado',
  FAILED: '✖ Fallido / no llegó',
  REFUNDED: '↩ Reembolsado',
}

const btn = (bg, color = '#fff', border = 'none') => ({
  padding: '5px 9px', backgroundColor: bg, color, border, borderRadius: '4px', cursor: 'pointer', fontSize: '12px',
})

/** Pagos de una reserva: ver, confirmar/rechazar Zelle informados y cargar pagos a mano. */
export default function PaymentsModal({ booking, onClose, onChange }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ method: 'ZELLE', kind: 'DEPOSIT', amount: '50', payer_name: '', reference: '', notes: '' })

  async function load() {
    setError('')
    const r = await fetch(`/api/admin/payments?booking_uuid=${booking.booking_uuid}`)
    const j = await r.json().catch(() => ({}))
    if (!r.ok) return setError(j.error || `Error ${r.status}`)
    setData(j)
    const first = j.summary.options[0]
    if (first) setForm((f) => ({ ...f, kind: first.kind, amount: String(first.amount) }))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.booking_uuid])

  async function act(body, confirmMsg) {
    if (confirmMsg && !window.confirm(confirmMsg)) return
    setBusy(true)
    setError('')
    try {
      const r = await fetch('/api/admin/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) return setError(j.error || `Error ${r.status}`)
      onChange(booking.booking_uuid, { status: j.status, deposit_paid_usd: j.summary?.paid, payments_reported: 0 })
      if (j.voucherDraft) alert(j.voucherSent ? '✅ Seña completa: la confirmación ya salió al cliente.' : '✅ Seña completa: la confirmación quedó en borrador en Gmail.')
      else if (j.waitingGuide) alert('✅ Seña completa. Elegí el guía y la confirmación sale sola.')
      await load()
    } finally {
      setBusy(false)
    }
  }

  const s = data?.summary

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '720px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>💰 Pagos — {booking.client_name}</h3>
        {error && <p style={{ color: '#c0392b', fontWeight: 'bold' }}>❌ {error}</p>}
        {!data ? (
          !error && <p>Cargando…</p>
        ) : (
          <>
            <p style={{ margin: '4px 0' }}>
              Total <b>${s.total}</b> · Pagado <b>${s.paid}</b> · Saldo <b>${s.balance}</b>
              {s.balanceDueDate && <> · vence {s.balanceDueDate}</>}
              {s.balanceMethod === 'CASH' && <> · 💵 saldo en efectivo al guía</>}
            </p>
            <p style={{ margin: '4px 0', color: s.depositPaid ? '#27ae60' : '#e67e22' }}>
              {s.depositPaid ? '✅ Seña cubierta' : `⏳ Falta la seña ($${s.deposit})`}
            </p>
            <p style={{ margin: '4px 0 12px' }}>
              Link de pago del cliente:{' '}
              <a href={`/pay/${booking.booking_uuid}`} target="_blank" rel="noreferrer">/pay/{booking.booking_uuid.slice(0, 8)}…</a>
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                  <th style={{ padding: '6px' }}>Fecha</th>
                  <th style={{ padding: '6px' }}>Método</th>
                  <th style={{ padding: '6px' }}>Tipo</th>
                  <th style={{ padding: '6px' }}>Monto</th>
                  <th style={{ padding: '6px' }}>Estado</th>
                  <th style={{ padding: '6px' }}>Pagó / Ref.</th>
                  <th style={{ padding: '6px' }}></th>
                </tr>
              </thead>
              <tbody>
                {data.payments.length === 0 && (
                  <tr><td colSpan="7" style={{ padding: '8px', color: '#7f8c8d' }}>Sin pagos todavía.</td></tr>
                )}
                {data.payments.map((p) => (
                  <tr key={p.id} style={{ borderTop: '1px solid #eee', background: p.status === 'REPORTED' ? '#fef9e7' : 'transparent' }}>
                    <td style={{ padding: '6px' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '6px' }}>{METHOD_LABEL[p.method]}</td>
                    <td style={{ padding: '6px' }}>{KIND_LABEL[p.kind]}</td>
                    <td style={{ padding: '6px' }}>${Number(p.amount_usd)}</td>
                    <td style={{ padding: '6px' }}>{STATUS_LABEL[p.status]}{p.confirmed_by ? <><br /><small>{p.confirmed_by}</small></> : null}</td>
                    <td style={{ padding: '6px' }}>
                      {p.payer_name}{p.reference ? <><br /><small>{p.reference}</small></> : null}
                      {p.notes ? <><br /><small style={{ color: '#7f8c8d' }}>{p.notes}</small></> : null}
                    </td>
                    <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>
                      {p.status === 'REPORTED' && (
                        <>
                          <button disabled={busy} style={btn('#28a745')}
                            onClick={() => act({ action: 'confirm', payment_id: p.id }, `¿Confirmar que llegó el Zelle de $${Number(p.amount_usd)} de "${p.payer_name}"?`)}>
                            ✅ Llegó
                          </button>{' '}
                          <button disabled={busy} style={btn('#fff', '#dc3545', '1px solid #dc3545')}
                            onClick={() => act({ action: 'reject', payment_id: p.id }, '¿Marcar este Zelle como NO recibido?')}>
                            ✖ No llegó
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                act({ action: 'record', booking_uuid: booking.booking_uuid, ...form, amount: Number(form.amount) },
                  `¿Registrar ${KIND_LABEL[form.kind]} de $${form.amount} por ${METHOD_LABEL[form.method]}?`)
              }}
              style={{ marginTop: '16px', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'flex-end' }}
            >
              <b style={{ width: '100%' }}>➕ Registrar un pago recibido (Zelle visto en el banco, efectivo, etc.)</b>
              <label>Método<br />
                <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  <option value="ZELLE">Zelle</option>
                  <option value="CASH">Efectivo</option>
                  <option value="STRIPE">Stripe (manual)</option>
                </select>
              </label>
              <label>Tipo<br />
                <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                  <option value="DEPOSIT">Seña</option>
                  <option value="BALANCE">Saldo</option>
                  <option value="FULL">Total</option>
                  <option value="OTHER">Otro</option>
                </select>
              </label>
              <label>Monto USD<br />
                <input type="number" min="0.01" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={{ width: '90px' }} />
              </label>
              <label>Quién pagó<br />
                <input value={form.payer_name} onChange={(e) => setForm({ ...form, payer_name: e.target.value })} style={{ width: '150px' }} />
              </label>
              <label>Ref. / n° Zelle<br />
                <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} style={{ width: '130px' }} />
              </label>
              <label style={{ flex: 1, minWidth: '150px' }}>Nota<br />
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ width: '100%' }} />
              </label>
              <button type="submit" disabled={busy} style={btn('#007bff')}>Registrar</button>
            </form>
          </>
        )}
        <div style={{ textAlign: 'right', marginTop: '14px' }}>
          <button type="button" onClick={onClose} style={btn('#fff', '#333', '1px solid #ccc')}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
