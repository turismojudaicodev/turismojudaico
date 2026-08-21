import { useState } from 'react'

export default function DashboardTableBookings({ bookings: initialBookings }) {
  const [activeTab, setActiveTab] = useState('INQUIRY_RECEIVED')
  const [bookings, setBookings] = useState(initialBookings)
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })

  // 1. LÓGICA DE ORDENAMIENTO (SORT)
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // 2. FUNCIÓN PARA AVANZAR ESTADO
  const handleNextStage = async (id, currentStatus) => {
    // Definimos el flujo lógico (Pipeline)
    const flow = {
      'INQUIRY_RECEIVED': 'PENDING_SECURITY_VETTING',
      'PENDING_SECURITY_VETTING': 'PENDING_DEPOSIT',
      'PENDING_DEPOSIT': 'CONFIRMED_ASSIGNED'
    }
    
    const nextStatus = flow[currentStatus]
    if (!nextStatus) return

    // Actualizamos en Base de datos
    await fetch('/api/admin/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: nextStatus })
    })

    // Actualizamos la vista local para no tener que recargar la página
    setBookings(bookings.map(b => b.id === id ? { ...b, status: nextStatus } : b))
  }

  // Ordenamos y filtramos
  const sortedBookings = [...bookings].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const filteredBookings = sortedBookings.filter(booking => {
    if (activeTab === 'ALL') return true
    return booking.status === activeTab
  })

  // Estilos
  const tabStyle = (tabName) => ({
    padding: '10px 20px', cursor: 'pointer', border: 'none',
    borderBottom: activeTab === tabName ? '3px solid #0056b3' : '3px solid transparent',
    backgroundColor: activeTab === tabName ? '#f4f4f9' : 'transparent',
    fontWeight: activeTab === tabName ? 'bold' : 'normal',
  })

  return (
    <div>
      {/* PESTAÑAS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px', gap: '10px' }}>
        <button style={tabStyle('INQUIRY_RECEIVED')} onClick={() => setActiveTab('INQUIRY_RECEIVED')}>📥 1. Por Responder</button>
        <button style={tabStyle('PENDING_SECURITY_VETTING')} onClick={() => setActiveTab('PENDING_SECURITY_VETTING')}>🛡️ 2. Seguridad</button>
        <button style={tabStyle('PENDING_DEPOSIT')} onClick={() => setActiveTab('PENDING_DEPOSIT')}>💳 3. Esperando Pago</button>
        <button style={tabStyle('CONFIRMED_ASSIGNED')} onClick={() => setActiveTab('CONFIRMED_ASSIGNED')}>🚀 4. Confirmados</button>
        <button style={tabStyle('ALL')} onClick={() => setActiveTab('ALL')}>🗄️ Todas</button>
      </div>

      {/* TABLA */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th onClick={() => handleSort('created_at')} style={{ padding: '12px', cursor: 'pointer' }}>Fecha ↕️</th>
              <th onClick={() => handleSort('client_name')} style={{ padding: '12px', cursor: 'pointer' }}>Cliente ↕️</th>
              <th onClick={() => handleSort('destination_name')} style={{ padding: '12px', cursor: 'pointer' }}>Destino ↕️</th>
              <th style={{ padding: '12px' }}>Pax</th>
              <th style={{ padding: '12px' }}>Acciones Operativas</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No hay reservas en esta vista.</td></tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{new Date(b.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}><strong>{b.client_name}</strong><br/><small>{b.client_email}</small></td>
                  <td style={{ padding: '12px' }}>{b.destination_name}</td>
                  <td style={{ padding: '12px' }}>{b.pax_adults}</td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                    
                    {/* Botón de Borrador Exclusivo para la primera etapa */}
                    {b.status === 'INQUIRY_RECEIVED' && (
                      <a 
                        href="https://mail.google.com/mail/u/info@turismojudaico.com/#drafts" 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ padding: '6px 10px', backgroundColor: '#ffc107', color: '#000', textDecoration: 'none', borderRadius: '4px', fontSize: '12px' }}
                      >
                        ✍️ Abrir Borrador
                      </a>
                    )}

                    {/* Botón de Avanzar (si no está ya en el final) */}
                    {b.status !== 'CONFIRMED_ASSIGNED' && (
                      <button 
                        onClick={() => handleNextStage(b.id, b.status)}
                        style={{ padding: '6px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        ✅ Avanzar 
                      </button>
                    )}

                    {/* Botón Editar Básico */}
                    <button style={{ padding: '6px 10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                      ✏️ Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}