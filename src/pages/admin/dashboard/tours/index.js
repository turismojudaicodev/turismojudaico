// NPM
import { useEffect, useState } from 'react'
// Local
import { getContent } from 'lib/api'
// Components
import AdminLayout from '@/components/AdminLayout'
import Notification, { NotificationLoading } from '@/components/Notification'
import DashboardTableTours from '@/components/DashboardTableTours'
import Message from '@/components/Message'
import Link from 'next/link'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function ExistingTours({ tours, setTours }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  // const [featuredToursCounter, setFeaturedToursCounter] = useState(0)

  useEffect(() => {}, [])

  return (
    <>
      <h2 className={styles.actionTitle}>Tours</h2>
      <DashboardTableTours table={tours} setVisibleTable={setTours} />
      {errorMessage && (
        <Notification
          type="error"
          notification={errorMessage}
          setNotification={setErrorMessage}
        />
      )}
      {infoMessage && (
        <Notification
          notification={infoMessage}
          setNotification={setInfoMessage}
        />
      )}
    </>
  )
}

export default function Dashboard() {
  const [tours, setTours] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data: tours, error: toursError } = await getContent(
        '/api/content/tours'
      )
      setIsLoading(false)
      if (toursError) {
        setErrorMessage('Error al cargar tours')
        return
      }
      setTours(tours)
    }
    setIsLoading(true)
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Tours</h1>
        <NotificationLoading message="Cargando tours..." />
      </AdminLayout>
    )
  }

  if (errorMessage.length > 0) {
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Tours</h1>
        <Message type="error" message={errorMessage} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Tours</h1>
      <Link href="#" className={styles.actionButtonSelected}>
        Mostar Tours
      </Link>
      <Link
        href="/admin/dashboard/tours/create"
        className={styles.actionButton}
      >
        Crear Tour
      </Link>
      <ExistingTours tours={tours} setTours={setTours} />
    </AdminLayout>
  )
}
