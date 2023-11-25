// NPM
import { useEffect, useState } from 'react'
// Local
import { getContent } from 'lib/api'
// Components
import DashboardTableNewsletter from '@/components/DashboardTableNewsletter'
import AdminLayout from '@/components/AdminLayout'
import { NotificationLoading } from '@/components/Notification'
import AdminButtonLoader from '@/components/AdminButtonLoader'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function Newsletter({ content, setContent }) {
  return (
    <>
      <h2 className={styles.actionTitle}>Suscripciones</h2>
      <DashboardTableNewsletter table={content} setVisibleTable={setContent} />
    </>
  )
}

export default function Dashboard() {
  const [content, setContent] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    async function fetchPostContent() {
      await getContent('/api/newsletter?limit=50&offset=0').then(({ data }) =>
        setContent(data)
      )
      setIsLoading(false)
    }
    setIsLoading(true)
    fetchPostContent()
  }, [])

  const handleLoadNext = async () => {
    await getContent(
      `/api/newsletter?limit=${limit}&offset=${offset + limit}`
    ).then(({ data }) => setContent(data))
    setOffset((v) => v + limit)
  }

  const handleLoadPrev = async () => {
    await getContent(
      `/api/newsletter?limit=${limit}&offset=${offset - limit}`
    ).then(({ data }) => setContent(data))
    setOffset((v) => v - limit)
  }

  if (isLoading)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Newsletter</h1>
        <NotificationLoading message="Cargando suscriptores" />
      </AdminLayout>
    )

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Newsletter</h1>
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
      <Newsletter content={content} setContent={setContent} />
    </AdminLayout>
  )
}
