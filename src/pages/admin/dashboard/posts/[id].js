// NPM
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuill } from 'react-quilljs'
// Local
import {
  deleteContent,
  getContent,
  getUniqueContent,
  updateUniqueContent,
} from 'lib/api'
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
import RichText from '@/components/RichText'
import Message from '@/components/Message'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function PostForm({ post, data }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(post.pais || null)
  const [selectedCategories, setSelectedCategories] = useState(
    data.selectedCategories || []
  )

  const { quill: quillSpanish, quillRef: quillRefSpanish } = useQuill()
  const { quill: quillEnglish, quillRef: quillRefEnglish } = useQuill()

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

    const categoriesToAdd = selectedCategories.filter((category) => {
      return !data.selectedCategories.some(
        (prevCategory) => prevCategory.codigo === category.codigo
      )
    })
    formData.categorias = categoriesToAdd

    const response = await updateUniqueContent(
      '/api/content/posts',
      post.codigo,
      formData
    )
    const { message, error } = response
    setIsLoading(false)
    if (error) {
      setErrorMessage(error)
      return
    }

    setInfoMessage(message)
  }

  const handleDeleteCategory = async (category) => {
    if (
      !confirm(
        `¿Desea quitar la categoría "${category.nombre}" a la atracción?`
      )
    )
      return

    if (data.selectedCategories.some((cat) => cat.codigo === category.codigo)) {
      setIsLoading(true)
      const response = await deleteContent(
        `/api/content/posts/${post.codigo}/deleteCategory`,
        category.codigo
      )
      const { message, error } = response
      setIsLoading(false)

      if (error) {
        setErrorMessage(error)
        return
      }
      setInfoMessage(message)
    }

    setSelectedCategories((prev) =>
      prev.filter((cat) => cat.codigo !== category.codigo)
    )
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
      <div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={styles.formCreate}>
            <InputText
              label="Nombre en español"
              name="nombre"
              defaultValue={post.nombre}
            />
            <RichText
              quill={quillSpanish}
              quillRef={quillRefSpanish}
              initialContent={post?.texto}
            />
            <Textarea
              label="Descripción en español"
              name="descripcion"
              defaultValue={post?.descripcion}
            />
          </div>
          <div className={styles.formCreate}>
            <InputText
              label="Nombre en inglés"
              name="nombre_en"
              defaultValue={post.nombre_en}
            />
            <RichText
              quill={quillEnglish}
              quillRef={quillRefEnglish}
              initialContent={post?.texto_en}
              required
            />
            <Textarea
              label="Descripción en inglés"
              name="descripcion_en"
              defaultValue={post?.descripcion_en}
              required
            />
          </div>
        </div>
        <InputImage label="Imagen1" name="imagen1" />
        {post.imagen1 && <p>Imagen1 actual: {post.imagen1}</p>}
        <InputImage label="Imagen2" name="imagen2" />
        {post.imagen2 && <p>Imagen2 actual: {post.imagen2}</p>}
        <InputImage label="Imagen3" name="imagen3" />
        {post.imagen3 && <p>Imagen3 actual: {post.imagen3}</p>}
        <InputImage label="Imagen4" name="imagen4" />
        {post.imagen4 && <p>Imagen4 actual: {post.imagen4}</p>}
        <InputImage label="Imagen5" name="imagen5" />
        {post.imagen5 && <p>Imagen5 actual: {post.imagen5}</p>}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Select
            label="País"
            name="pais"
            options={data.countries}
            defaultValue={post.pais}
            attrs={{ onChange: (ev) => setSelectedCountry(ev.target.value) }}
          />
          <Select
            label="Ciudad"
            name="ciudad"
            defaultValue={post.ciudad}
            options={data?.cities?.filter(
              (city) => city.pais == selectedCountry
            )}
          />
        </div>
        <Select
          // se borra el atributo name para que no se mande al back
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
                return alert('Esta categoría ya se encuentra asignada')
              setSelectedCategories((prev) => [...prev, category])
            },
          }}
        />
        <p>Categorías actuales</p>
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
          <InputText
            label="Dirección"
            name="direccion"
            defaultValue={post.direccion}
          />
          <InputText
            label="Localidad"
            name="localidad"
            defaultValue={post.localidad}
          />
        </div>
        {/* <Select
          label="Categoría"
          name="categoria"
          options={data.categories}
          defaultValue={post.categoria}
        /> */}
        <InputText
          label="Teléfono"
          name="telefono"
          defaultValue={post.telefono}
        />
        <InputText label="Link" name="link" defaultValue={post.link} />
        <InputText label="Mail" name="mail" defaultValue={post.mail} />
        <InputNumber
          label="Orden"
          name="orden"
          min={0}
          defaultValue={post.orden}
        />
        <InputNumber
          label="Estado"
          name="estado"
          min={0}
          max={2}
          defaultValue={post.estado}
        />
      </div>
      <AdminButtonLoader attrs={{ type: 'submit' }} isLoading={isLoading}>
        Aplicar cambios
      </AdminButtonLoader>
    </form>
  )
}

export default function PostEditor() {
  const [post, setPost] = useState({})
  const [errorMessage, setErrorMessage] = useState('')
  const [data, setData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data: post, error: postError } = await getUniqueContent(
        '/api/content/posts',
        router.query.id
      )
      const { data: countries, error: countriesError } = await getContent(
        '/api/content/countries?reduced=1&active=1'
      )
      const { data: cities, error: citiesError } = await getContent(
        '/api/content/cities?reduced=1&active=1'
      )
      const { data: categories, error: categoriesError } = await getContent(
        '/api/content/categories?reduced=1&active=1'
      )
      const { data: selectedCategories, error: errorSelectedCategories } =
        await getContent(`/api/content/posts/${router.query.id}/categories`)
      setIsLoading(false)
      if (
        countriesError ||
        citiesError ||
        categoriesError ||
        postError ||
        errorSelectedCategories
      ) {
        setErrorMessage(
          `Error del servidor: ${countriesError ?? ''} ${citiesError ?? ''} ${
            categoriesError ?? ''
          } ${postError ?? ''} ${errorSelectedCategories ?? ''}`
        )
        return
      }
      setPost(post)
      setData({
        countries,
        categories,
        cities,
        selectedCategories,
      })
    }
    setIsLoading(true)
    if (router.isReady) fetchData()
  }, [router.isReady])

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
      {isLoading ? (
        <NotificationLoading message="Cargando datos" />
      ) : (
        <PostForm post={post} data={data} />
      )}
    </AdminLayout>
  )
}
