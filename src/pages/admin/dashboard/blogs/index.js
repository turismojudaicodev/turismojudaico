// NPM
import { useEffect, useState } from 'react'
import { useQuill } from 'react-quilljs'
// Local
import { getContent, postContent } from 'lib/api'
import { uploadCloudinaryImage } from 'helpers'
// Components
import AdminButtonLoader from '@/components/AdminButtonLoader'
import AdminLayout from '@/components/AdminLayout'
import DashboardTableBlogs from '@/components/DashboardTableBlogs'
import Notification, { NotificationLoading } from '@/components/Notification'
import Message from '@/components/Message'
import {
  InputImage,
  InputText,
  InputNumber,
} from '@/components/DashboardComponents'
import RichText from '@/components/RichText'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function ExistingBlogs({ blogs, setVisisbleBlogs }) {
  return (
    <>
      <h2 className={styles.actionTitle}>Blogs</h2>
      <DashboardTableBlogs
        table={blogs}
        setVisibleTable={setVisisbleBlogs}
        idAlias="blogId"
      />
    </>
  )
}

function BlogCreator({ setVisisbleBlogs }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { quill: quillSpanish, quillRef: quillRefSpanish } = useQuill()
  const { quill: quillEnglish, quillRef: quillRefEnglish } = useQuill()

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    setInfoMessage('')
    setErrorMessage('')

    const formData = Object.fromEntries(new FormData(ev.target))

    // Agregar las imagenes al objeto
    if (formData.imagen.size > 0) {
      const data = await uploadCloudinaryImage(formData.imagen)
      formData.imagen = data.secure_url
    } else {
      formData.imagen = ''
    }
    if (formData.imagen_en.size > 0) {
      const data = await uploadCloudinaryImage(formData.imagen_en)
      formData.imagen_en = data.secure_url
    } else {
      formData.imagen_en = ''
    }

    formData.texto = quillSpanish.root.innerHTML
    formData.texto_en = quillEnglish.root.innerHTML

    const response = await postContent('/api/content/blogs', formData)
    setIsLoading(false)

    const { message, error, data } = response

    if (error) {
      setErrorMessage(error)
      return
    }

    setVisisbleBlogs((prev) => [
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
        <h3 className={styles.languageTitle} style={{ marginTop: '1rem' }}>
          Crear blog
        </h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={styles.formCreate}>
            <InputText label="Nombre en español" name="nombre" required />
            <RichText quill={quillSpanish} quillRef={quillRefSpanish} />
            {/* <Textarea label="Texto en español" name="texto" required /> */}
            <InputImage label="Imagen en español" name="imagen" />
          </div>
          <div className={styles.formCreate}>
            <InputText label="Nombre en inglés" name="nombre_en" required />
            <RichText quill={quillEnglish} quillRef={quillRefEnglish} />
            {/* <Textarea label="Texto en inglés" name="texto_en" required /> */}
            <InputImage label="Imagen en inglés" name="imagen_en" />
          </div>
        </div>
        <InputNumber label="Estado" name="estado" />
      </div>
      <AdminButtonLoader attrs={{ type: 'submit' }} isLoading={isLoading}>
        Crear blog
      </AdminButtonLoader>
    </form>
  )
}

export default function Dashboard() {
  const [view, setView] = useState({ read: true, create: false })
  const [blogs, setBlogs] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await getContent('/api/content/blogs')
      setIsLoading(false)
      if (error) return setErrorMessage(error)
      setBlogs(data)
    }
    setIsLoading(true)
    fetchData()
  }, [])

  if (isLoading)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Blogs</h1>
        <NotificationLoading message="Cargando blogs" />
      </AdminLayout>
    )

  if (errorMessage.length > 0) {
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Blogs</h1>
        <Message type="error" message={errorMessage} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Blogs</h1>
      <button
        className={
          view.read ? styles.actionButtonSelected : styles.actionButton
        }
        onClick={() => setView({ read: true, create: false })}
      >
        Mostar Blogs
      </button>
      <button
        className={
          view.create ? styles.actionButtonSelected : styles.actionButton
        }
        onClick={() => setView({ read: false, create: true })}
      >
        Crear Blog
      </button>

      {view.read && <ExistingBlogs blogs={blogs} setVisisbleBlogs={setBlogs} />}
      {view.create && <BlogCreator setVisisbleBlogs={setBlogs} />}
    </AdminLayout>
  )
}
