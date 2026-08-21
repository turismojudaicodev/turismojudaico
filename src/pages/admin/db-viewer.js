import { useEffect, useState } from 'react'

export default function DatabaseViewer() {
  const [dbData, setDbData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/check-schema')
      .then(res => res.json())
      .then(data => {
        setDbData(data)
        setLoading(false)
      })
      .catch(err => console.error(err))
  }, [])

  if (loading) return <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>Cargando tablas de MySQL... ⏳</div>

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>🗄️ Visor de Base de Datos (Dev Mode)</h1>
      <p>Total de tablas encontradas: <strong>{dbData.total_tablas}</strong></p>

      {Object.entries(dbData.estructura_de_nuevas_tablas).map(([nombreTabla, columnas]) => (
        <div key={nombreTabla} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#0056b3', marginTop: 0, borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            Tabla: {nombreTabla}
          </h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef', color: '#333' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Columna</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Tipo de Dato</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Permite Nulo</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Extra / Default</th>
              </tr>
            </thead>
            <tbody>
              {columnas.map((col, i) => (
                <tr key={col.Field} style={{ borderBottom: '1px solid #eee', backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#444' }}>{col.Field}</td>
                  <td style={{ padding: '10px', color: '#d63384' }}>{col.Type}</td>
                  <td style={{ padding: '10px' }}>{col.Null === 'YES' ? '✅ Sí' : '❌ No'}</td>
                  <td style={{ padding: '10px', color: '#666' }}>{col.Extra || col.Default || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}