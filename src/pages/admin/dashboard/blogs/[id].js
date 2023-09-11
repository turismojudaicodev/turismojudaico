// NPM
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
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
// Styles
import styles from '@/styles/Dashboard.module.css'

function BlogForm({ blog }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h3 className={styles.languageTitle}>Editar blog {blog?.codigo}</h3>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className={styles.formCreate}>
          <InputText
            label="Nombre en español"
            name="nombre"
            defaultValue={blog?.nombre}
            required
          />
          <Textarea
            label="Texto en español"
            name="texto"
            defaultValue={blog?.texto}
          />
          <InputImage label="Imagen en español" name="imagen" />
          {blog?.imagen && <p>Imagen actual: {blog?.imagen}</p>}
        </div>
        <div className={styles.formCreate}>
          <InputText
            label="Nombre en inglés"
            name="nombre_en"
            defaultValue={blog?.nombre_en}
            required
          />
          <Textarea
            label="Texto en inglés"
            name="texto_en"
            defaultValue={blog?.texto_en}
          />
          <InputImage label="Imagen en inglés" name="imagen_en" />
          {blog?.imagen_en && <p>Imagen actual: {blog?.imagen_en}</p>}
        </div>
      </div>
      <InputNumber
        label="Estado"
        name="estado"
        defaultValue={blog?.estado}
        required
      />
    </div>
  )
}

export default function Blog() {
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState('')
  const [blog, setBlog] = useState({})
  const [infoMessage, setInfoMessage] = useState('')
  const [isDataLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchBlog() {
      const { data, error } = await getUniqueContent(
        '/api/content/blogs',
        router.query.id
      )
      if (error) return setErrorMessage(error)
      setBlog(data)
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
    formData.imagen_en = await handleCloudinaryUpload(formData.imagen_en)

    const res = await updateUniqueContent(
      '/api/content/blogs',
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
      <h2 className={styles.actionTitle}>Editar Blog</h2>
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
      {isDataLoading && <NotificationLoading />}
      <form onSubmit={handleUpdate}>
        <BlogForm blog={blog} />
        <AdminButtonLoader isLoading={isDataLoading}>
          Confirmar
        </AdminButtonLoader>
      </form>
    </AdminLayout>
  )
}
