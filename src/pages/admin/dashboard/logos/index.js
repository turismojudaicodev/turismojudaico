// NPM
import { useEffect, useState } from 'react'
// Local
import { getContent, postContent } from 'lib/api'
import { handleCloudinaryUpload } from 'helpers'
// Components
import DashboardTable from '@/components/DashboardTableLogos'
import AdminLayout from '@/components/AdminLayout'
import Notification, { NotificationLoading } from '@/components/Notification'
import {
  InputImage,
  InputText,
  InputNumber,
} from '@/components/DashboardComponents'
import Message from '@/components/Message'
import AdminButtonLoader from '@/components/AdminButtonLoader'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function Creator({ setVisisbleLogos }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    setInfoMessage('')
    setErrorMessage('')

    const formData = Object.fromEntries(new FormData(ev.target))

    formData.imagen = await handleCloudinaryUpload(formData.imagen)
    if (!formData.imagen) delete formData.imagen

    const response = await postContent('/api/content/logos', formData)
    setIsLoading(false)

    const { message, error, data } = response

    if (error) {
      setErrorMessage(error)
      return
    }

    setVisisbleLogos((prev) => [
      ...prev,
      { ...formData, codigo: data.insertId },
    ])
    setInfoMessage(message)
  }

  return (
    <form onSubmit={handleSubmit}>
      {infoMessage && (
        <Notification
          notification={infoMessage}
          setNotification={setInfoMessage}
        />
      )}
      {errorMessage && (
        <Notification
          notification={errorMessage}
          setNotification={setErrorMessage}
          type="error"
        />
      )}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <InputText label="Nombre" name="nombre" required />
          <InputImage label="Imagen en español" name="imagen" required />
          <InputNumber label="Orden" name="orden" required />
          <InputNumber label="Estado" name="estado" min={0} max={2} required />
        </div>
      </div>
      <AdminButtonLoader attrs={{ type: 'submit' }} isLoading={isLoading}>
        Agregar Logo
      </AdminButtonLoader>
    </form>
  )
}

export default function Dashboard() {
  const [view, setView] = useState({ read: true, create: false })
  const [content, setContent] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchLogos() {
      const { data, error } = await getContent('/api/content/logos')
      setIsLoading(false)
      if (error) return setErrorMessage(error)
      setContent(data)
    }
    setIsLoading(true)
    fetchLogos()
  }, [])

  if (isLoading)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Logos</h1>
        <NotificationLoading message="Cargando Logos" />
      </AdminLayout>
    )

  if (errorMessage.length > 0)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Logos</h1>
        <Message type="error" message={errorMessage} />
      </AdminLayout>
    )

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Logos</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button
          className={
            view.read ? styles.actionButtonSelected : styles.actionButton
          }
          onClick={() => setView({ read: true, create: false })}
        >
          Mostar Logos
        </button>
        <button
          className={
            view.create ? styles.actionButtonSelected : styles.actionButton
          }
          onClick={() => setView({ read: false, create: true })}
        >
          Agregar Logo
        </button>
      </div>
      {view.read && (
        <DashboardTable table={content} setVisibleTable={setContent} />
      )}
      {view.create && <Creator setVisisbleLogos={setContent} />}
    </AdminLayout>
  )
}
