// NPM
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuill } from 'react-quilljs'
// Local
import { getUniqueContent, updateUniqueContent } from 'lib/api'
// Components
import AdminLayout from '@/components/AdminLayout'
import Notification, { NotificationLoading } from '@/components/Notification'
import AdminButtonLoader from '@/components/AdminButtonLoader'
import { InputNumber, InputText } from '@/components/DashboardComponents'
import RichText from '@/components/RichText'
// Styles
import styles from '@/styles/Dashboard.module.css'

export default function Blog() {
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState('')
  const [description, setDescription] = useState({})
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { quill: quillSpanish, quillRef: quillRefSpanish } = useQuill()
  const { quill: quillEnglish, quillRef: quillRefEnglish } = useQuill()

  useEffect(() => {
    async function fetchBlog() {
      const { data, error } = await getUniqueContent(
        '/api/content/about',
        router.query.id
      )
      if (error) return setErrorMessage(error)
      setDescription(data)
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

    formData.contenido = quillSpanish.root.innerHTML
    formData.contenido_en = quillEnglish.root.innerHTML

    const res = await updateUniqueContent(
      '/api/content/about',
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
      <h2 className={styles.actionTitle}>Editar Descripción</h2>
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
          <h3 className={styles.languageTitle}>
            Editar descripción {description?.codigo}
          </h3>
          <InputText
            label="Nombre"
            name="titulo"
            defaultValue={description?.titulo}
            required
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className={styles.formCreate}>
              <RichText
                quill={quillSpanish}
                quillRef={quillRefSpanish}
                initialContent={description?.contenido}
              />
            </div>
            <div className={styles.formCreate}>
              <RichText
                quill={quillEnglish}
                quillRef={quillRefEnglish}
                initialContent={description?.contenido_en}
              />
            </div>
          </div>
          <InputNumber
            label="Estado"
            name="estado"
            defaultValue={description?.estado}
            required
          />
        </div>
        <AdminButtonLoader isLoading={isLoading}>Confirmar</AdminButtonLoader>
      </form>
    </AdminLayout>
  )
}
