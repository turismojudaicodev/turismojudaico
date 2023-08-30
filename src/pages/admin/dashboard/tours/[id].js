// NPM
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
// Local
import { getContent, getUniqueContent, updateUniqueContent } from 'lib/api'
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
// Styles
import styles from '@/styles/Dashboard.module.css'

function TourForm({ tour, data }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))

    // const response = await updateUniqueContent(
    //   '/api/content/tours',
    //   tour.codigo,
    //   formData
    // )
    // const { message, error } = response
    setIsLoading(false)
    // if (error) {
    //   setErrorMessage(error)
    //   return
    // }
    // setInfoMessage(message)
  }

  return (
    <form onSubmit={handleSubmit}>
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
      <div className={styles.formCreate}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={styles.formCreate}>
            <InputText
              label="Nombre"
              name="nombre"
              defaultValue={tour.nombre}
            />
            <Textarea
              label="Descripción"
              name="descripcion"
              defaultValue={tour.descripcion}
            />
            <Textarea
              label="Descripción corta"
              name="descripcioncorta"
              defaultValue={tour.descripcioncorta}
            />
            <InputText
              label="Headkeyword"
              name="headkeyword"
              defaultValue={tour.headkeyword}
            />
            <InputText
              label="Head descripción"
              name="headdescripcion"
              defaultValue={tour.headdescripcion}
            />
          </div>
          <div className={styles.formCreate}>
            <InputText
              label="Nombre en inglés"
              name="nombre_en"
              defaultValue={tour.nombre_en}
            />
            <Textarea
              label="Descripción en inglés"
              name="descripcion_en"
              defaultValue={tour.descripcion_en}
            />
            <Textarea
              label="Descripción corta en inglés"
              name="descripcioncorta_en"
              defaultValue={tour.descripcioncorta_en}
            />
            <InputText
              label="Headkeyword en inglés"
              name="headkeyword_en"
              defaultValue={tour.headkeyword_en}
            />
            <InputText
              label="Head descripción en inglés"
              name="headdescripcion_en"
              defaultValue={tour.headdescripcion_en}
            />
          </div>
        </div>

        <InputImage label="Imagen1" name="imagen1" />
        {tour.imagen1 && <p>Imagen actual: {tour.imagen1}</p>}
        <InputImage label="Imagen2" name="imagen2" />
        {tour.imagen2 && <p>Imagen actual: {tour.imagen2}</p>}
        <InputImage label="Imagen3" name="imagen3" />
        {tour.imagen3 && <p>Imagen actual: {tour.imagen3}</p>}
        <InputImage label="Imagen4" name="imagen4" />
        {tour.imagen4 && <p>Imagen actual: {tour.imagen4}</p>}

        <InputText label="Video" name="video" defaultValue={tour.video} />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={styles.formCreate}>
            <Select
              label="Atraccion1"
              name="atraccion1"
              options={data.posts}
              defaultValue={tour.atraccion1}
            />
            <Select
              label="Atraccion2"
              name="atraccion2"
              options={data.posts}
              defaultValue={tour.atraccion2}
            />
            <Select
              label="Atraccion3"
              name="atraccion3"
              options={data.posts}
              defaultValue={tour.atraccion3}
            />
            <Select
              label="Atraccion4"
              name="atraccion4"
              options={data.posts}
              defaultValue={tour.atraccion4}
            />
            <Select
              label="Atraccion5"
              name="atraccion5"
              options={data.posts}
              defaultValue={tour.atraccion5}
            />
          </div>
          <div className={styles.formCreate}>
            <Select
              label="Atraccion6"
              name="atraccion6"
              options={data.posts}
              defaultValue={tour.atraccion6}
            />
            <Select
              label="Atraccion7"
              name="atraccion7"
              options={data.posts}
              defaultValue={tour.atraccion7}
            />
            <Select
              label="Atraccion8"
              name="atraccion8"
              options={data.posts}
              defaultValue={tour.atraccion8}
            />
            <Select
              label="Atraccion9"
              name="atraccion9"
              options={data.posts}
              defaultValue={tour.atraccion9}
            />
            <Select
              label="Atraccion10"
              name="atraccion10"
              options={data.posts}
              defaultValue={tour.atraccion10}
            />
          </div>
        </div>
        <Select
          label="Proveedor"
          name="proveedor"
          options={data.providers}
          defaultValue={tour.proveedor}
        />
        <InputNumber
          label="Estado"
          name="estado"
          min={0}
          max={2}
          required
          defaultValue={tour.estado}
        />
      </div>
      <AdminButtonLoader isLoading={isLoading}>
        Aplicar cambios
      </AdminButtonLoader>
    </form>
  )
}

export default function TourEditor() {
  const [tour, setTour] = useState({})
  const [data, setData] = useState({
    providers: [],
    posts: [],
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data: tour, error: tourError } = await getUniqueContent(
        '/api/content/tours',
        router.query.id
      )
      const { data: posts, error: postsError } = await getContent(
        '/api/content/posts'
      )
      const { data: providers, error: providersError } = await getContent(
        '/api/content/providers'
      )
      setIsLoading(false)
      if (postsError || providersError || tourError) {
        setErrorMessage('Error al cargar datos iniciales')
        return
      }
      setTour(tour)
      setData((prev) => ({ ...prev, posts: posts }))
      setData((prev) => ({ ...prev, providers: providers }))
    }
    setIsLoading(true)
    if (router.isReady) fetchData()
  }, [router.isReady])

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
      <h2 className={styles.actionTitle}>Editar Tour</h2>
      <TourForm tour={tour} data={data} />
    </AdminLayout>
  )
}
