// NPM
import { useEffect, useState } from 'react'
import { useQuill } from 'react-quilljs'
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
import RichText from '@/components/RichText'
import Link from 'next/link'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function PostForm({ data }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState([])
  const { quill: quillSpanish, quillRef: quillRefSpanish } = useQuill()
  const { quill: quillEnglish, quillRef: quillRefEnglish } = useQuill()

  const handleDeleteCategory = async (category) => {
    if (
      !confirm(
        `¿Desea quitar la categoría "${category.nombre}" a la atracción?`
      )
    )
      return

    setSelectedCategories((prev) =>
      prev.filter((cat) => cat.codigo !== category.codigo)
    )
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()

    setIsLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))
    formData.imagen1 = await handleCloudinaryUpload(formData.imagen1)
    if (!formData.imagen1) delete formData.imagen1
    formData.imagen2 = await handleCloudinaryUpload(formData.imagen2)
    if (!formData.imagen2) delete formData.imagen2
    formData.imagen3 = await handleCloudinaryUpload(formData.imagen3)
    if (!formData.imagen3) delete formData.imagen3
    formData.imagen4 = await handleCloudinaryUpload(formData.imagen4)
    if (!formData.imagen4) delete formData.imagen4
    formData.imagen5 = await handleCloudinaryUpload(formData.imagen5)
    if (!formData.imagen5) delete formData.imagen5

    formData.texto = quillSpanish.root.innerHTML
    formData.texto_en = quillEnglish.root.innerHTML

    formData.categorias = selectedCategories

    const response = await postContent('/api/content/posts', formData)
    const { message, error } = response
    setIsLoading(false)
    if (error) {
      setErrorMessage(error)
      return
    }
    setInfoMessage(message)
    document.getElementById('post-form').reset()
  }

  return (
    <form onSubmit={handleSubmit} id="post-form">
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
      <div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={styles.formCreate} style={{ marginBottom: '5rem' }}>
            <InputText label="Nombre en español" name="nombre" required />
            <RichText quill={quillSpanish} quillRef={quillRefSpanish} />
            <Textarea
              label="Descripción en español"
              name="descripcion"
              required
            />
          </div>
          <div className={styles.formCreate}>
            <InputText label="Nombre en inglés" name="nombre_en" required />
            <RichText quill={quillEnglish} quillRef={quillRefEnglish} />
            <Textarea
              label="Descrición en inglés"
              name="descripcion_en"
              required
            />
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
            required
            attrs={{ onChange: (ev) => setSelectedCountry(ev.target.value) }}
          />
          <Select
            label="Ciudad"
            name="ciudad"
            options={data?.cities?.filter(
              (city) => city.pais == selectedCountry
            )}
            required
          />
        </div>
        <Select
          label="Categoría"
          options={data.categories}
          attrs={{
            onChange: (ev) => {
              const categoryId = parseInt(ev.target.value)
              const category = data.categories.find(
                (category) => category.codigo === categoryId
              )
              if (!category) return
              if (
                selectedCategories.some(
                  (category) => category.codigo === categoryId
                )
              )
                return alert('ya existe')
              setSelectedCategories((prev) => [...prev, category])
            },
          }}
        />
        <ul
          style={{
            paddingLeft: '2rem',
            marginBottom: '1rem',
            marginTop: '.25rem',
          }}
        >
          {selectedCategories.map((category) => (
            <li key={category.codigo} className={utils.editableItem}>
              <span>{category.nombre}</span>
              <button
                type="button"
                onClick={() => handleDeleteCategory(category)}
              >
                X
              </button>
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <InputText label="Dirección" name="direccion" />
          <InputText label="Localidad" name="localidad" />
        </div>
        <InputText label="Teléfono" name="telefono" />
        <InputText label="Link" name="link" />
        <InputText label="Mail" name="mail" />
        <InputNumber label="Orden" name="orden" min={0} required />
        <InputNumber label="Estado" name="estado" min={0} max={2} required />
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
      const { data: categories, error: categoriesError } = await getContent(
        '/api/content/categories?reduced=1&active=1'
      )
      const { data: countries, error: countriesError } = await getContent(
        '/api/content/countries?reduced=1&active=1'
      )
      const { data: cities, error: citiesError } = await getContent(
        '/api/content/cities?reduced=1&active=1'
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
        cities,
        categories,
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
