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

  const handleNextStage = async (booking) => {
    if (booking.status === 'INQUIRY_RECEIVED') {
      await fetch('/api/admin/booking', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, status: 'PENDING_SECURITY_VETTING' })
      })
      setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: 'PENDING_SECURITY_VETTING' } : b))
    
    } else if (booking.status === 'PENDING_SECURITY_VETTING' ||booking.status === 'SECURITY_DOCS_RECEIVED' || booking.status === 'SECURITY_APPROVED') {
      await fetch('/api/admin/send-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, email: booking.client_email, name: booking.client_name, destination: booking.destination_name })
      })
      setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: 'PENDING_DEPOSIT' } : b))
    
    } else if (booking.status === 'PENDING_DEPOSIT') {
      await fetch('/api/admin/send-voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, email: booking.client_email, name: booking.client_name, destination: booking.destination_name })
      })
      setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: 'CONFIRMED_ASSIGNED' } : b))
    }
  }

 const handleDelete = async (id) => {
    const isConfirmed = window.confirm('¿Estás seguro de que quieres borrar esta reserva de forma permanente?')
    if (!isConfirmed) return

    try {
      const response = await fetch('/api/admin/booking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        setBookings(bookings.filter(b => b.id !== id));
      } else {
        const errorData = await response.json();
        alert(`Fallo en el servidor: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error en la petición de borrado:", error);
    }
  }

  const openEditModal = (booking) => {
    const formattedDate = new Date(booking.tour_date).toISOString().split('T')[0]
    setEditingBooking(booking.id)
    setFormData({ ...booking, tour_date: formattedDate })
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    await fetch('/api/admin/booking', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    setBookings(bookings.map(b => b.id === formData.id ? { ...b, ...formData } : b))
    setEditingBooking(null)
  }

  const triggerPayment = async (uuid, mode) => {
  const confirmMsg = mode === 'direct' 
    ? '¿Estás seguro de enviar el correo de pago DIRECTAMENTE al cliente ahora?' 
    : '¿Quieres crear un borrador de pago en Gmail y abrirlo?';
    
  if (!window.confirm(confirmMsg)) return;

  try {
    const res = await fetch('/api/admin/send-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid, mode })
    });

    if (res.ok) {
      const data = await res.json();
        
        if (mode === 'draft' && data.draftId) {
          setBookings(bookings.map(b => b.booking_uuid === uuid ? { ...b, status: 'PENDING_DEPOSIT', gmail_draft_id: data.draftId } : b));
        } else {
          alert('✅ Correo de cobro enviado directamente al cliente.');
          setBookings(bookings.map(b => b.booking_uuid === uuid ? { ...b, status: 'PENDING_DEPOSIT' } : b));
        }
    } else {
      alert('❌ Hubo un error al procesar el pago.');
    }
  } catch (error) {
    console.error(error);
    alert('❌ Error de red.');
  }
};

const handleRejectEmail = async (booking) => {
  if (!window.confirm(`¿Enviar correo de rechazo a ${booking.client_name} y cancelar la reserva?`)) return;
  try {
    const res = await fetch('/api/admin/send-rejection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: booking.client_email, name: booking.client_name, destination: booking.destination_name })
    });
    if (res.ok) alert('✅ Correo de cancelación enviado al pasajero.');
    else alert('❌ Error al enviar el correo.');
  } catch (error) {
    alert('❌ Error de red.');
  }
};

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
                          onClick={() => triggerPayment(b.booking_uuid, 'draft')}
                          href={`/api/admin/drafts/open?id=${b.booking_uuid || b.id}&draftId=${b.gmail_draft_id}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ padding: '6px 10px', backgroundColor: '#fff', color: '#007bff', border: '1px solid #007bff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          📝 Borrador Pago
                        </button>
                        <button 
                          onClick={() => triggerPayment(b.booking_uuid, 'direct')}
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
                      <button onClick={() => handleNextStage(b)} style={{ padding: '6px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        ✅ Pasar a Seguridad 
                      </button>
                    )}
                    {b.status === 'PENDING_SECURITY_VETTING' && (
                      <button onClick={() => handleNextStage(b)} style={{ padding: '6px 10px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        💳 Armar Cobro 
                      </button>
                    )}
                    {b.status === 'PENDING_DEPOSIT' && (
                      <button onClick={() => handleNextStage(b)} style={{ padding: '6px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
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
                  <option value="PENDING_DEPOSIT">Esperando Pago</option>
                  <option value="CONFIRMED_ASSIGNED">Confirmado</option>
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