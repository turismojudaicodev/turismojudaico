// NPM
import { useEffect, useState } from 'react'
// Local
import { getContent, postContent } from 'lib/api'
import { handleCloudinaryUpload } from 'helpers'
// Components
import AdminLayout from '@/components/AdminLayout'
import Notification, { NotificationLoading } from '@/components/Notification'
import AdminButtonLoader from '@/components/AdminButtonLoader'
import {
  InputImage,
  InputNumber,
  InputText,
  Select,
  Textarea,
} from '@/components/DashboardComponents'
import Link from 'next/link'
// Styles
import styles from '@/styles/Dashboard.module.css'

function TourForm({ data }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))
    formData.imagen1 = await handleCloudinaryUpload(formData.imagen1)
    formData.imagen2 = await handleCloudinaryUpload(formData.imagen2)
    formData.imagen3 = await handleCloudinaryUpload(formData.imagen3)
    formData.imagen4 = await handleCloudinaryUpload(formData.imagen4)
    formData.destacadohomegrande = '0'
    formData.destacadohomechico = '0'

    const response = await postContent('/api/content/tours', formData)
    const { message, error } = response
    setIsLoading(false)

    if (error) {
      setErrorMessage(error)
      return
    }
    setInfoMessage(message)
    document.getElementById('tour-form').reset()
  }

  return (
    <form onSubmit={handleSubmit} id="tour-form">
      {infoMessage && (
        <Notification
          notification={infoMessage}
          setNotification={setInfoMessage}
        />
      )}
      {errorMessage && (
        <Notification
          type="error"
          notification={errorMessage}
          setNotification={setErrorMessage}
        />
      )}
      <div className={styles.formCreate}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={styles.formCreate}>
            <InputText label="Nombre" name="nombre" required />
            <Textarea label="Descripción" name="descripcion" />
            <Textarea label="Descripción corta" name="descripcioncorta" />
            <InputText label="Headkeyword" name="headkeyword" />
            <InputText label="Head descripción" name="headdescripcion" />
          </div>
          <div className={styles.formCreate}>
            <InputText label="Nombre en inglés" name="nombre_en" required />
            <Textarea label="Descripción en inglés" name="descripcion_en" />
            <Textarea
              label="Descripción corta en inglés"
              name="descripcioncorta_en"
            />
            <InputText label="Headkeyword en inglés" name="headkeyword_en" />
            <InputText
              label="Head descripción en inglés"
              name="headdescripcion_en"
            />
          </div>
        </div>

        <InputImage label="Imagen1" name="imagen1" />
        <InputImage label="Imagen2" name="imagen2" />
        <InputImage label="Imagen3" name="imagen3" />
        <InputImage label="Imagen4" name="imagen4" />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={styles.formCreate}>
            <Select label="Atraccion1" name="atraccion1" options={data.posts} />
            <Select label="Atraccion2" name="atraccion2" options={data.posts} />
            <Select label="Atraccion3" name="atraccion3" options={data.posts} />
            <Select label="Atraccion4" name="atraccion4" options={data.posts} />
            <Select label="Atraccion5" name="atraccion5" options={data.posts} />
          </div>
          <div className={styles.formCreate}>
            <Select label="Atraccion6" name="atraccion6" options={data.posts} />
            <Select label="Atraccion7" name="atraccion7" options={data.posts} />
            <Select label="Atraccion8" name="atraccion8" options={data.posts} />
            <Select label="Atraccion9" name="atraccion9" options={data.posts} />
            <Select
              label="Atraccion10"
              name="atraccion10"
              options={data.posts}
            />
          </div>
        </div>

        <InputNumber
          label="Destacado home grande"
          name="destacadohomegrande"
          min={0}
          max={1}
        />
        <InputNumber
          label="Destacado home chico"
          name="destacadohomechico"
          min={0}
          max={1}
        />

        <InputText label="Video" name="video" />

        <InputNumber label="Orden" name="orden" min={0} required />
        <InputNumber label="Estado" name="estado" min={0} max={2} required />
      </div>
      <AdminButtonLoader isLoading={isLoading}>Crear</AdminButtonLoader>
    </form>
  )
}

export default function TourCreator() {
  const [data, setData] = useState({ posts: [] })
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data: posts, error: postsError } = await getContent(
        '/api/content/posts'
      )
      setIsLoading(false)
      if (postsError) {
        setErrorMessage(postsError)
        return
      }
      setData((prev) => ({ ...prev, posts: posts }))
    }
    setIsLoading(true)
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout>
        <h2 className={styles.actionTitle}>Crear Tour</h2>
        <NotificationLoading message="Cargando datos iniciales" />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
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
      <h2 className={styles.actionTitle}>Crear Tour</h2>
      <Link href="/admin/dashboard/tours" className={styles.actionButton}>
        Mostrar Tours
      </Link>
      <Link href="#" className={styles.actionButtonSelected}>
        Crear Tour
      </Link>
      <TourForm data={data} />
    </AdminLayout>
  )
}
