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

export default function Blog() {
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState('')
  const [blog, setBlog] = useState({})
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { quill: quillSpanish, quillRef: quillRefSpanish } = useQuill()
  const { quill: quillEnglish, quillRef: quillRefEnglish } = useQuill()

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
    if (!formData.imagen) delete formData.imagen
    formData.imagen_en = await handleCloudinaryUpload(formData.imagen_en)
    if (!formData.imagen_en) delete formData.imagen_en

    formData.texto = quillSpanish.root.innerHTML
    formData.texto_en = quillEnglish.root.innerHTML

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
      {isLoading && <NotificationLoading />}
      <form onSubmit={handleUpdate}>
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
              <RichText
                quill={quillSpanish}
                quillRef={quillRefSpanish}
                initialContent={blog?.texto}
              />
              <Textarea
                label="Descripción en español"
                name="descripcion"
                defaultValue={blog?.descripcion}
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
              <RichText
                quill={quillEnglish}
                quillRef={quillRefEnglish}
                initialContent={blog?.texto_en}
              />
              <Textarea
                label="Descripción en inglés"
                name="descripcion_en"
                defaultValue={blog?.descripcion_en}
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
        <AdminButtonLoader isLoading={isLoading}>Confirmar</AdminButtonLoader>
      </form>
    </AdminLayout>
  )
}
