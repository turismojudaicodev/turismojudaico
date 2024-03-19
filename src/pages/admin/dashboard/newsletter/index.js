// NPM
import { useEffect, useState } from 'react'
// Local
import { getContent } from 'lib/api'
// Components
import DashboardTableNewsletter from '@/components/DashboardTableNewsletter'
import AdminLayout from '@/components/AdminLayout'
import Notification, { NotificationLoading } from '@/components/Notification'
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
  const [errorMessage, setErrorMessage] = useState('')
  const [loadingMessage, setLoadingMessage] = useState('')
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
    setLoadingMessage('')
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

  const handleDownloadSheet = async () => {
    setIsLoading(true)
    setLoadingMessage('Descargando archivo')
    try {
      const response = await fetch('/api/newsletter/exportData')
      const blob = await response.blob()
      console.log(response)
      console.log(blob)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'newsletter.json'
      document.body.appendChild(a)
      a.click()
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      if (response.error) {
        console.log('error de la api,', response.error)
        setErrorMessage(response.error)
      }
    } catch (error) {
      console.log(error)
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Newsletter</h1>
        <NotificationLoading
          message={
            loadingMessage.length > 0 ? loadingMessage : 'Cargando suscriptores'
          }
        />
      </AdminLayout>
    )

  return (
    <AdminLayout>
      {errorMessage && (
        <Notification
          type="error"
          notification={errorMessage}
          setNotification={setErrorMessage}
        />
      )}
      <h1 className={utils.bigTitle}>Newsletter</h1>

      <div style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={styles.submitButton}
          onClick={handleDownloadSheet}
        >
          Descargar plantilla
        </button>
      </div>

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
