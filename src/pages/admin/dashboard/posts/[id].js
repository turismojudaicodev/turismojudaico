// NPM
import { useEffect, useState } from 'react'
import { useQuill } from 'react-quilljs'
// Local
import { prisma } from 'lib/prisma'
import { updateUniqueContent } from 'lib/api'
import { setTimedMessage } from 'helpers'
// Components
import AdminLayout from '@/components/AdminLayout'
import Message from '@/components/Message'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'
import 'quill/dist/quill.snow.css' // quill snow theme

export async function getStaticPaths() {
  const posts = await prisma.post.findMany()
  const paths = posts.map((post) => ({ params: { id: post.id.toString() } }))

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps(context) {
  const postId = Number(context.params.id)
  const post = await prisma.post.findUnique({ where: { id: postId } })
  const categories = await prisma.category.findMany()
  const subCategories = await prisma.subCategory.findMany({
    include: {
      category: true,
    },
  })
  const countries = await prisma.country.findMany()
  const cities = await prisma.city.findMany({
    include: {
      country: true,
    },
  })
  const data = { post, categories, subCategories, countries, cities }
  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
  }
}

export default function Post({ data }) {
  const { post, countries, cities, categories, subCategories } = data

  let { quill, quillRef } = useQuill({
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],

        [{ list: 'ordered' }, { list: 'bullet' }],

        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['link', 'image', 'video'],
      ],
    },
  })
  const [formData, setFormData] = useState({
    title: post.title,
    description: post.description,
    image: post.image,
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(post.content)
    }
  }, [quill])

  const handleUpdate = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)

    const res = await updateUniqueContent(
      '/api/content/posts',
      post.id.toString(),
      {
        ...formData,
        content: quill.root.innerHTML,
      }
    )
    const { data, message, error } = res
    setIsLoading(false)
    if (error) return setTimedMessage(error, setErrorMessage)
    setTimedMessage(message, setInfoMessage)
    console.log(data)
  }

  return (
    <AdminLayout>
      <h2 className={styles.actionTitle}>Editar Post</h2>
      <form className={styles.formCreate} onSubmit={handleUpdate}>
        <div>
          <label className={utils.inputRequired} htmlFor="title">
            Título
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={(ev) =>
              setFormData((value) => ({ ...value, title: ev.target.value }))
            }
            className={styles.input}
          ></input>
        </div>
        <div>
          <label className={utils.inputRequired} htmlFor="description">
            Descripción
          </label>
          <textarea
            type="text"
            name="description"
            id="description"
            value={formData.description}
            onChange={(ev) =>
              setFormData((value) => ({
                ...value,
                description: ev.target.value,
              }))
            }
            className={styles.input}
          ></textarea>
        </div>
        <div>
          <label htmlFor="image">Imagen de portada</label>
          <input
            type="text"
            placeholder="Url de la imagen"
            name="image"
            id="image"
            value={formData.image || ''}
            onChange={(ev) =>
              setFormData((value) => ({ ...value, image: ev.target.value }))
            }
            className={styles.input}
          ></input>
        </div>
        <div>
          <label className={utils.inputRequired}>Contenido</label>
          <div>
            <div ref={quillRef} />
          </div>
        </div>
        <div>
          <label htmlFor="country">País</label>
          <select
            id="country"
            name="country"
            className={styles.input}
            onChange={(ev) =>
              setFormData((prev) => ({ ...prev, countryId: ev.target.value }))
            }
            defaultValue={post.countryId}
          >
            <option value=""> </option>
            {countries.map((country) => (
              <option value={country.id} key={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="city">Ciudad</label>
          <select
            id="city"
            name="city"
            className={styles.input}
            onChange={(ev) =>
              setFormData((prev) => ({ ...prev, cityId: ev.target.value }))
            }
            defaultValue={post.cityId}
          >
            <option value=""> </option>
            {cities.map(
              (city) =>
                formData.countryId === city.country.id.toString() && (
                  <option value={city.id} key={city.id}>
                    {city.name}
                  </option>
                )
            )}
          </select>
        </div>
        <div>
          <label htmlFor="category">Categoría</label>
          <select
            id="category"
            name="category"
            className={styles.input}
            onChange={(ev) =>
              setFormData((prev) => ({ ...prev, categoryId: ev.target.value }))
            }
            defaultValue={post.categoryId}
          >
            <option value=""> </option>
            {categories.map((category) => (
              <option
                value={category.id}
                key={category.id}
                selected={category.id === post.categoryId}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="subCategory">Sub Categoría</label>
          <select
            id="subCategory"
            name="subCategory"
            className={styles.input}
            onChange={(ev) =>
              setFormData((prev) => ({
                ...prev,
                subCategoryId: ev.target.value,
              }))
            }
            defaultValue={post.subCategoryId}
          >
            <option value=""> </option>
            {subCategories.map(
              (subCategory) =>
                formData.categoryId === subCategory.category.id.toString() && (
                  <option value={subCategory.id} key={subCategory.id}>
                    {subCategory.name}
                  </option>
                )
            )}
          </select>
        </div>
        <button className={styles.submitButton} type="submit">
          {isLoading ? 'Cargando...' : 'Confirmar'}
        </button>
        {errorMessage && <Message type="error" message={errorMessage} />}
        {infoMessage && <Message type="info" message={infoMessage} />}
      </form>
    </AdminLayout>
  )
}
