import { useEffect, useState } from 'react'
import { getContent } from 'lib/api'
import DashboardTable from '@/components/DashboardTableBookings'
import AdminLayout from '@/components/AdminLayout'
import { NotificationLoading } from '@/components/Notification'
import utils from '@/styles/utils.module.css'

export default function Dashboard() {
  const [content, setContent] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      try {

        const data = await getContent('/api/bookings')
        
        setContent(data)
      } catch (error) {
        console.error('Error cargando reservas:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchBookings()
  }, [])

  if (isLoading)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Gestión de Reservas (Pipeline)</h1>
        <NotificationLoading message="Cargando reservas operativas..." />
      </AdminLayout>
    )

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Gestión de Reservas (Pipeline)</h1>
      
      <DashboardTable bookings={content} />
    </AdminLayout>
  )
}