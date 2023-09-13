// Local
import { getContent } from 'lib/api'
// Components
import Link from 'next/link'
import AdminLayout from '@/components/AdminLayout'
import { useEffect, useState } from 'react'
import { NotificationLoading } from '@/components/Notification'
import Message from '@/components/Message'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'
import dashboardStyles from '@/styles/Dashboard.module.css'
import DashboardTableProviders from '@/components/DashboardTableProviders'

export default function Partners() {
  const [providers, setProviders] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await getContent('/api/content/providers')
      setIsLoading(false)
      if (error) return setErrorMessage(error)
      setProviders(data)
    }
    setIsLoading(true)
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Proveedores</h1>
        <NotificationLoading message="Cargando proveedores" />
      </AdminLayout>
    )
  }

  if (errorMessage.length > 0) {
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Proveedores</h1>
        <Message type="error" message={errorMessage} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Proveedores</h1>
      <div style={{ marginBlock: '2rem' }}>
        <Link href="" className={styles.actionButtonSelected}>
          Mostar Proveedores
        </Link>
        <Link
          href="/admin/dashboard/providers/create"
          className={styles.actionButton}
        >
          Agregar Proveedor
        </Link>
      </div>
      <div>
        <DashboardTableProviders
          table={providers}
          setVisibleTable={setProviders}
        />
      </div>
    </AdminLayout>
  )
}
