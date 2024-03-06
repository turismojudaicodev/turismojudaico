// NPM
import { useEffect, useState } from 'react'
import { useQuill } from 'react-quilljs'
// Local
import { getContent, postContent } from 'lib/api'
// Components
import AdminLayout from '@/components/AdminLayout'
import DashboardTableContents from '@/components/DashboardTableContents'
import { InputNumber, InputText } from '@/components/DashboardComponents'
import AdminButtonLoader from '@/components/AdminButtonLoader'
import Message from '@/components/Message'
import Notification, { NotificationLoading } from '@/components/Notification'
import RichText from '@/components/RichText'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function ExistingContent({ setVisibleContents, visibleContents }) {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <DashboardTableContents
        table={visibleContents}
        setVisibleTable={setVisibleContents}
      />
    </div>
  )
}

function Form({ setVisibleContents }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { quill: quillSpanish, quillRef: quillRefSpanish } = useQuill()
  const { quill: quillEnglish, quillRef: quillRefEnglish } = useQuill()

  const handleFormSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))
    formData.contenido = quillSpanish.root.innerHTML
    formData.contenido_en = quillEnglish.root.innerHTML

    const response = await postContent('/api/content/about', formData)

    setIsLoading(false)

    const { message, error, data } = response

    if (error) return setErrorMessage(error)

    setVisibleContents((prev) =>
      prev.concat({ ...formData, codigo: data.insertId })
    )
    setInfoMessage(message)
    document.getElementById('about-form').reset()
  }

  return (
    <div>
      <form onSubmit={handleFormSubmit} id="about-form">
        <InputText label="Nombre" name="titulo" required />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={styles.formCreate}>
            <h3>Texto en español</h3>
            <RichText quill={quillSpanish} quillRef={quillRefSpanish} />
          </div>
          <div className={styles.formCreate}>
            <h3>Texto en inglés</h3>
            <RichText quill={quillEnglish} quillRef={quillRefEnglish} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginBlock: '1rem' }}>
          <InputNumber label="Estado" name="estado" min={0} max={2} required />
        </div>
        <AdminButtonLoader
          attrs={{ type: 'submit', style: { marginBottom: '1rem' } }}
          isLoading={isLoading}
        >
          Agregar
        </AdminButtonLoader>
      </form>
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
    </div>
  )
}

export default function About() {
  const [view, setView] = useState({ read: true, create: false })
  const [visibleContents, setVisibileContents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setIsLoading(true)
    async function fetchContents() {
      const { data, error } = await getContent('/api/content/about')
      setIsLoading(false)
      console.log(data)
      if (error) {
        setErrorMessage(error)
        return
      }
      setVisibileContents(data)
    }
    setIsLoading(true)
    fetchContents()
  }, [])

  if (isLoading)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Quienes Somos</h1>
        <NotificationLoading message="Cargando" />
      </AdminLayout>
    )

  if (errorMessage.length > 0)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Quienes Somos</h1>
        <Message type="error" message={errorMessage} />
      </AdminLayout>
    )

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Quienes Somos</h1>
      <button
        className={
          view.read ? styles.actionButtonSelected : styles.actionButton
        }
        onClick={() => setView({ read: true, create: false })}
      >
        Mostar Descripciones
      </button>
      <button
        className={
          view.create ? styles.actionButtonSelected : styles.actionButton
        }
        onClick={() => setView({ read: false, create: true })}
      >
        Crear Descripción
      </button>
      {view.create && (
        <Form
          visibleContents={visibleContents}
          setVisibleContents={setVisibileContents}
        />
      )}
      {view.read &&
        (visibleContents.length > 0 ? (
          <ExistingContent
            setVisibleContents={setVisibileContents}
            visibleContents={visibleContents}
          />
        ) : (
          <p style={{ marginBlock: '2rem' }}>No hay contenido cargado</p>
        ))}
    </AdminLayout>
  )
}
