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
import Message from '@/components/Message'
import Link from 'next/link'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function PostForm({ data }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)

  const handleSubmit = async (ev) => {
    ev.preventDefault()

    setIsLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))
    // formData.imagen1 = handleCloudinaryUpload(formData.imagen1)
    // formData.imagen2 = handleCloudinaryUpload(formData.imagen2)
    // formData.imagen3 = handleCloudinaryUpload(formData.imagen3)
    // formData.imagen4 = handleCloudinaryUpload(formData.imagen4)
    // formData.imagen5 = handleCloudinaryUpload(formData.imagen5)

    // const response = await postContent('/api/content/posts/new', {
    //   post: formData,
    // })
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
          setInfoMessage={setInfoMessage}
        />
      )}
      <div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={styles.formCreate}>
            <InputText label="Nombre en español" name="nombre" />
            <Textarea label="Texto en español" name="texto" />
          </div>
          <div className={styles.formCreate}>
            <InputText label="Nombre en inglés" name="nombre_en" />
            <Textarea label="Texto en inglés" name="texto_en" />
          </div>
        </div>
        <InputImage label="Imagen1" name="imagen1" />
        <InputImage label="Imagen2" name="imagen2" />
        <InputImage label="Imagen3" name="imagen3" />
        <InputImage label="Imagen4" name="imagen4" />
        <InputImage label="Imagen5" name="imagen5" />
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Select
            label="País"
            name="pais"
            options={data.countries}
            attrs={{ onChange: (ev) => setSelectedCountry(ev.target.value) }}
          />
          <Select
            label="Ciudad"
            name="ciudad"
            options={data?.cities?.filter(
              (city) => city.pais == selectedCountry
            )}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <InputText label="Dirección" name="direccion" />
          <InputText label="Localidad" name="localidad" />
        </div>
        <Select label="Categoría" name="categoria" options={data.categories} />
        <InputText label="Link" name="link" />
        <InputText label="Mail" name="mail" />
        <InputNumber label="Orden" name="orden" min={0} />
        <InputNumber label="Estado" name="estado" min={0} max={2} />
      </div>
      <AdminButtonLoader attrs={{ type: 'submit' }} isLoading={isLoading}>
        Crear
      </AdminButtonLoader>
    </form>
  )
}

export default function PostCreator() {
  const [errorMessage, setErrorMessage] = useState('')
  const [data, setData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data: countries, error: countriesError } = await getContent(
        '/api/content/countries?reduced=1&active=1'
      )
      const { data: cities, error: citiesError } = await getContent(
        '/api/content/cities?reduced=1&active=1'
      )
      const { data: categories, error: categoriesError } = await getContent(
        '/api/content/categories?reduced=1&active=1'
      )
      setIsLoading(false)
      if (countriesError || citiesError || categoriesError) {
        setErrorMessage(
          `Error del servidor: ${countriesError ?? ''} ${citiesError ?? ''} ${
            categoriesError ?? ''
          }`
        )
        return
      }
      setData({
        countries,
        categories,
        cities,
      })
    }
    setIsLoading(true)
    fetchData()
  }, [])

  if (errorMessage.length > 0) {
    return (
      <AdminLayout>
        <h3 className={styles.languageTitle}>Crear Post</h3>
        <Message type="error" message={errorMessage} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h3 className={utils.bigTitle}>Atracciones Judaicas</h3>
      <Link href="/admin/dashboard/posts" className={styles.actionButton}>
        Mostar Posts
      </Link>
      <Link href="" className={styles.actionButtonSelected}>
        Crear Post
      </Link>
      {isLoading ? (
        <NotificationLoading message="Cargando datos" />
      ) : (
        <PostForm data={data} />
      )}
    </AdminLayout>
  )
}
