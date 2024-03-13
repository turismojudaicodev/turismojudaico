// NPM
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuill } from 'react-quilljs'
// Local
import { getUniqueContent, updateUniqueContent } from 'lib/api'
import { handleCloudinaryUpload } from 'helpers'
// Components
import AdminLayout from '@/components/AdminLayout'
import Notification, { NotificationLoading } from '@/components/Notification'
import AdminButtonLoader from '@/components/AdminButtonLoader'
import {
  InputImage,
  InputNumber,
  InputText,
  Textarea,
} from '@/components/DashboardComponents'
import RichText from '@/components/RichText'
// Styles
import styles from '@/styles/Dashboard.module.css'

export default function Supporter() {
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState('')
  const [logo, setLogo] = useState({})
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchBlog() {
      const { data, error } = await getUniqueContent(
        '/api/content/logos',
        router.query.id
      )
      if (error) return setErrorMessage(error)
      setLogo(data)
      setIsLoading(false)
    }
    setIsLoading(true)
    if (router.isReady) fetchBlog()
  }, [router.isReady])

  const handleUpdate = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    setInfoMessage('')
    setErrorMessage('')

    const formData = Object.fromEntries(new FormData(ev.target))

    formData.imagen = await handleCloudinaryUpload(formData.imagen)
    if (!formData.imagen) delete formData.imagen

    const res = await updateUniqueContent(
      '/api/content/logos',
      router.query.id.toString(),
      formData
    )

    setIsLoading(false)
    const { message, error } = res
    if (error) {
      setErrorMessage(error)
      return
    }
    setInfoMessage(message)
  }

  return (
    <AdminLayout>
      <h2 className={styles.actionTitle}>Editar Logo</h2>
      {errorMessage && (
        <Notification
          notification={errorMessage}
          setNotification={setErrorMessage}
          type="error"
        />
      )}
      {infoMessage && (
        <Notification
          notification={infoMessage}
          setNotification={setInfoMessage}
        />
      )}
      {isLoading && <NotificationLoading />}
      <form onSubmit={handleUpdate}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 className={styles.languageTitle}>Editar logo {logo?.codigo}</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className={styles.formCreate}>
              <InputText
                label="Nombre en español"
                name="nombre"
                defaultValue={logo?.nombre}
                required
              />
              <InputImage label="Imagen en español" name="imagen" />
              {logo?.imagen && <p>Imagen actual: {logo?.imagen}</p>}
              {logo?.imagen && (
                <img src={logo?.imagen} alt={logo?.imagen} width={200} />
              )}
            </div>
          </div>
          <InputNumber
            label="Orden"
            name="orden"
            defaultValue={logo?.orden}
            required
          />
          <InputNumber
            label="Estado"
            name="estado"
            defaultValue={logo?.estado}
            required
          />
        </div>
        <AdminButtonLoader isLoading={isLoading}>
          Aplicar cambios
        </AdminButtonLoader>
      </form>
    </AdminLayout>
  )
}
