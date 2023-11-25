// NPM
import { useEffect, useState } from 'react'
// Local
import { getContent } from 'lib/api'
// Components
import DashboardTable from '@/components/DashboardTableBookings'
import AdminLayout from '@/components/AdminLayout'
import { NotificationLoading } from '@/components/Notification'
import AdminButtonLoader from '@/components/AdminButtonLoader'
// Styles
import utils from '@/styles/utils.module.css'

export default function Dashboard() {
  const [content, setContent] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    async function fetchPostContent() {
      await getContent('/api/bookings?limit=50&offset=0').then(({ data }) =>
        setContent(data)
      )
      setIsLoading(false)
    }
    setIsLoading(true)
    fetchPostContent()
  }, [])

  const handleLoadNext = async () => {
    await getContent(
      `/api/bookings?limit=${limit}&offset=${offset + limit}`
    ).then(({ data }) => setContent(data))
    setOffset((v) => v + limit)
  }

  const handleLoadPrev = async () => {
    await getContent(
      `/api/bookings?limit=${limit}&offset=${offset - limit}`
    ).then(({ data }) => setContent(data))
    setOffset((v) => v - limit)
  }

  if (isLoading)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Reservas</h1>
        <NotificationLoading message="Cargando reservas" />
      </AdminLayout>
    )

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Reservas</h1>
      <div style={{ marginBlock: '1rem' }}>
        {offset >= limit && (
          <AdminButtonLoader
            isLoading={isLoading}
            attrs={{ onClick: handleLoadPrev }}
          >
            {'<'}
          </AdminButtonLoader>
        )}
        <span>Página {offset / limit + 1}</span>
        <AdminButtonLoader
          isLoading={isLoading}
          attrs={{ onClick: handleLoadNext }}
        >
          {'>'}
        </AdminButtonLoader>
      </div>
      <DashboardTable table={content} setVisibleTable={setContent} />
    </AdminLayout>
  )
}
