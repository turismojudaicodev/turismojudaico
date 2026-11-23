import { useState } from 'react'

export default function DashboardTableBookings({ bookings: initialBookings }) {
  const [activeTab, setActiveTab] = useState('INQUIRY_RECEIVED')
  const [bookings, setBookings] = useState(initialBookings)
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  
  const [editingBooking, setEditingBooking] = useState(null)
  const [formData, setFormData] = useState({})

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'
    setSortConfig({ key, direction })
  }

  const updateLocalBooking = (id, changes) =>
    setBookings((current) => current.map((b) => (b.id === id ? { ...b, ...changes } : b)))

  /** Hace el request y muestra el error del servidor si falla. Devuelve los datos o null. */
  const apiRequest = async (url, method, body) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        alert(`❌ ${data.error || 'Error en el servidor'}`)
        return null
      }
      return data
    } catch (error) {
      console.error(error)
      alert('❌ Error de red.')
      return null
    }
  }

  const moveToSecurity = async (booking) => {
    const data = await apiRequest('/api/admin/booking', 'PUT', { id: booking.id, status: 'PENDING_SECURITY_VETTING' })
    if (!data) return
    if (!data.draftSent) alert('⚠️ Estado actualizado, pero no se encontró el borrador para enviar. Revisá Gmail.')
    updateLocalBooking(booking.id, { status: 'PENDING_SECURITY_VETTING' })
  }

  const triggerPayment = async (booking, mode) => {
    const confirmMsg = mode === 'direct'
      ? '¿Estás seguro de enviar el correo de pago DIRECTAMENTE al cliente ahora?'
      : '¿Querés crear un borrador de pago en Gmail?'
    if (!window.confirm(confirmMsg)) return

    const data = await apiRequest('/api/admin/send-payment', 'POST', { uuid: booking.booking_uuid, mode })
    if (!data) return
    if (mode === 'direct') alert(`✅ Correo de cobro enviado (total: USD ${data.total}).`)
    updateLocalBooking(booking.id, {
      status: 'PENDING_DEPOSIT',
      total_price_usd: data.total,
      ...(data.draftId && { gmail_draft_id: data.draftId }),
    })
  }

  const confirmPayment = async (booking) => {
    const data = await apiRequest('/api/admin/send-voucher', 'POST', { id: booking.id })
    if (!data) return
    updateLocalBooking(booking.id, { status: 'CONFIRMED_ASSIGNED', gmail_draft_id: data.draftId })
  }

  const handleRejectEmail = async (booking) => {
    if (!window.confirm(`¿Enviar correo de rechazo a ${booking.client_name} y cancelar la reserva?`)) return
    const data = await apiRequest('/api/admin/send-rejection', 'POST', { id: booking.id })
    if (!data) return
    alert('✅ Correo de cancelación enviado al pasajero.')
    updateLocalBooking(booking.id, { status: 'CANCELLED' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que querés borrar esta reserva de forma permanente?')) return
    const data = await apiRequest('/api/admin/booking', 'DELETE', { id })
    if (data) setBookings((current) => current.filter((b) => b.id !== id))
  }

  const openEditModal = (booking) => {
    const formattedDate = new Date(booking.tour_date).toISOString().split('T')[0]
    setEditingBooking(booking.id)
    setFormData({ ...booking, tour_date: formattedDate })
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    const { id, client_name, client_email, destination_name, tour_date, pax_adults, status } = formData
    const data = await apiRequest('/api/admin/booking', 'PUT', {
      id, client_name, client_email, destination_name, tour_date, pax_adults, status,
    })
    if (!data) return
    updateLocalBooking(id, formData)
    setEditingBooking(null)
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const filteredBookings = sortedBookings.filter(b => {
  if (activeTab === 'ALL') return true;
  if (activeTab === 'PENDING_SECURITY_VETTING') {
    return ['PENDING_SECURITY_VETTING', 'SECURITY_DOCS_RECEIVED', 'SECURITY_APPROVED', 'SECURITY_REJECTED'].includes(b.status);
  }
  return b.status === activeTab;
});

  const tabStyle = (tabName) => ({
    padding: '10px 20px', cursor: 'pointer', border: 'none',
    borderBottom: activeTab === tabName ? '3px solid #0056b3' : '3px solid transparent',
    backgroundColor: activeTab === tabName ? '#f4f4f9' : 'transparent',
    fontWeight: activeTab === tabName ? 'bold' : 'normal',
  })

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        <button style={tabStyle('INQUIRY_RECEIVED')} onClick={() => setActiveTab('INQUIRY_RECEIVED')}>📥 1. Por Responder</button>
        <button style={tabStyle('PENDING_SECURITY_VETTING')} onClick={() => setActiveTab('PENDING_SECURITY_VETTING')}>🛡️ 2. Seguridad</button>
        <button style={tabStyle('PENDING_DEPOSIT')} onClick={() => setActiveTab('PENDING_DEPOSIT')}>💳 3. Esperando Pago</button>
        <button style={tabStyle('CONFIRMED_ASSIGNED')} onClick={() => setActiveTab('CONFIRMED_ASSIGNED')}>🚀 4. Confirmados</button>
        <button style={tabStyle('ALL')} onClick={() => setActiveTab('ALL')}>🗄️ Todas</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th onClick={() => handleSort('created_at')} style={{ padding: '12px', cursor: 'pointer' }}>Fecha ↕️</th>
              <th onClick={() => handleSort('client_name')} style={{ padding: '12px', cursor: 'pointer' }}>Cliente ↕️</th>
              <th onClick={() => handleSort('destination_name')} style={{ padding: '12px', cursor: 'pointer' }}>Destino ↕️</th>
              <th onClick={() => handleSort('tour_date')} style={{ padding: '12px', cursor: 'pointer' }}>Fecha Tour ↕️</th>
              <th style={{ padding: '12px' }}>Pax</th>
              <th style={{ padding: '12px' }}>Acciones Operativas</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No hay reservas en esta vista.</td></tr>
            ) : (
              filteredBookings.map((b) => (
                <tr 
                  key={b.id} 
                  style={{ 
                    borderBottom: '1px solid #eee', 
                    backgroundColor: b.status === 'SECURITY_APPROVED' ? '#e8f8f5' : b.status === 'SECURITY_REJECTED' ? '#f8d7da' : 'transparent' 
                  }}
                >
                  <td style={{ padding: '12px' }}>{new Date(b.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}><strong>{b.client_name}</strong><br/><small>{b.client_email}</small></td>
                  <td style={{ padding: '12px' }}>{b.destination_name}</td>
                  <td style={{ padding: '12px' }}>{new Date(b.tour_date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{b.pax_adults}</td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>

                   {b.status === 'INQUIRY_RECEIVED' ? (
                      <a 
                        href={`/api/admin/drafts/open?id=${b.booking_uuid || b.id}&draftId=${b.gmail_draft_id}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-warning btn-sm text-dark font-weight-bold"
                      >
                        ✍️ Abrir Borrador
                      </a>
                    ) : (
                      <a 
                        href={`/api/admin/threads/open?id=${b.booking_uuid || b.id}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-secondary btn-sm"
                      >
                        Ver Historial
                      </a>
                    )}

                    {/* Botones estilizados para Seguridad Aprobada sin deformar la tabla */}
                    {b.status === 'SECURITY_APPROVED' && (
                      <>
                        <button 
                          onClick={() => triggerPayment(b, 'draft')}
                          style={{ padding: '6px 10px', backgroundColor: '#fff', color: '#007bff', border: '1px solid #007bff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          📝 Borrador Pago
                        </button>
                        <button 
                          onClick={() => triggerPayment(b, 'direct')}
                          style={{ padding: '6px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          💸 Enviar Directo
                        </button>
                      </>
                    )}

                    {b.status === 'SECURITY_REJECTED' && (
                      <>
                        <button 
                          onClick={() => handleRejectEmail(b)}
                          style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          📧 Enviar Rechazo
                        </button>
                      </>
                    )}
                    
                    {/* Botones Dinámicos de Avance */}
                    {b.status === 'INQUIRY_RECEIVED' && (
                      <button onClick={() => moveToSecurity(b)} style={{ padding: '6px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        ✅ Pasar a Seguridad 
                      </button>
                    )}
                    {b.status === 'PENDING_SECURITY_VETTING' && (
                      <button onClick={() => triggerPayment(b, 'draft')} style={{ padding: '6px 10px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        💳 Armar Cobro 
                      </button>
                    )}
                    {b.status === 'PENDING_DEPOSIT' && (
                      <button onClick={() => confirmPayment(b)} style={{ padding: '6px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        🚀 Confirmar Pago 
                      </button>
                    )}

                    <button onClick={() => openEditModal(b)} style={{ padding: '6px 10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      ✏️ Editar
                    </button>

                    <button 
                      onClick={() => handleDelete(b.id)} 
                      style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      🗑️ Borrar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Editar Reserva</h3>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              <label>Nombre del Cliente:
                <input type="text" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px' }} required />
              </label>
              
              <label>Email:
                <input type="email" value={formData.client_email} onChange={e => setFormData({...formData, client_email: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px' }} required />
              </label>
              
              <label>Destino:
                <input type="text" value={formData.destination_name} onChange={e => setFormData({...formData, destination_name: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px' }} required />
              </label>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{ flex: 1 }}>Fecha Tour:
                  <input type="date" value={formData.tour_date} onChange={e => setFormData({...formData, tour_date: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px' }} required />
                </label>
                <label style={{ width: '80px' }}>Pax:
                  <input type="number" min="1" value={formData.pax_adults} onChange={e => setFormData({...formData, pax_adults: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px' }} required />
                </label>
              </div>

              <label>Estado:
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
                  <option value="INQUIRY_RECEIVED">Por Responder</option>
                  <option value="PENDING_SECURITY_VETTING">Seguridad Pendiente</option>
                  <option value="SECURITY_DOCS_RECEIVED">Documentos Recibidos</option>
                  <option value="SECURITY_APPROVED">Seguridad Aprobada</option>
                  <option value="SECURITY_REJECTED">Seguridad Rechazada</option>
                  <option value="PENDING_DEPOSIT">Esperando Pago</option>
                  <option value="CONFIRMED_ASSIGNED">Confirmado</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={() => setEditingBooking(null)} style={{ padding: '8px 15px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}