// NPM
import { useState } from 'react'
// Local
// Components
import AdminLayout from '@/components/AdminLayout'
import Notification from '@/components/Notification'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/DashboardIndex.module.css'
import dashboardStyles from '@/styles/Dashboard.module.css'

export default function Dashboard() {
  const [infoMessage, setInfoMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  return (
    <AdminLayout>
      {errorMessage && (
        <Notification
          notification={errorMessage}
          type="error"
          setNotification={setErrorMessage}
        />
      )}
      {infoMessage && (
        <Notification
          notification={infoMessage}
          setNotification={setInfoMessage}
        />
      )}
      <h1 className={utils.bigTitle}>Inicio</h1>
      <div>
        <h2>Panel de administrador</h2>
        <p>
          Bienvenido/a al panel de administrador, utilice el menú lateral
          izquierdo para navegar entre las distintas secciones
        </p>
      </div>
    </AdminLayout>
  )
}
