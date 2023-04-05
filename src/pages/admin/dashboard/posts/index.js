// NPM
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useQuill } from 'react-quilljs'
// Local
import { useUser } from 'context/user'
import { postContent, deleteContent } from 'lib/api'
import { formatDate, setTimedMessage } from 'helpers'
import { prisma } from 'lib/prisma'
// Components
import AdminLayout from '@/components/AdminLayout'
import Message from '@/components/Message'
import Link from 'next/link'
import Image from 'next/image'
import DeleteIcon from 'public/icons/delete.svg'
import EditIcon from 'public/icons/edit.svg'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'
import 'quill/dist/quill.snow.css' // quill snow theme

function ExistingPosts({ posts, setVisiblePosts }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const handleDelete = async (postId) => {
    const result = await deleteContent('/api/content/posts', postId)
    const { message, error } = result
    if (error) return setTimedMessage(error, setErrorMessage)
    setTimedMessage(message, setInfoMessage)
    setVisiblePosts((prev) => prev.filter((post) => post.id !== postId))
  }

  return (
    <>
      <h2 className={styles.actionTitle}>Atracciones</h2>
      <div>
        {posts.map((post) => (
          <div className={styles.entryCard} key={post.id}>
            <div className={styles.entryTextContainer}>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <p>{formatDate(post.createdAt)}</p>
            </div>
            <div className={styles.entryButtonsContainer}>
              <Link
                href={`/admin/dashboard/posts/${post.id}`}
                className={styles.editButton}
              >
                <Image src={EditIcon} alt="Edit Icon" height={16} width={16} />
              </Link>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(post.id)}
              >
                <Image
                  src={DeleteIcon}
                  alt="Delete Icon"
                  height={16}
                  width={16}
                />
              </button>
            </div>
          </div>
        ))}
        <div className={styles.messageContainer}>
          {errorMessage && <Message type="error" message={errorMessage} />}
          {infoMessage && <Message type="info" message={infoMessage} />}
        </div>
      </div>
    </>
  )
}

function PostCreator({ setVisiblePosts, data: configData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    countryId: '',
    cityId: '',
    categoryId: '',
    subCategoryId: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const { countries, cities, categories, subCategories } = configData

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

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const htmlContent = quill.root.innerHTML
    const post = {
      ...formData,
      content: htmlContent,
    }
    const response = await postContent('/api/content/posts/new', post)
    const { data, message, error } = response
    if (error) return setTimedMessage(error, setErrorMessage)

    setVisiblePosts((prev) => [...prev, data])

    setFormData({
      title: '',
      description: '',
      image: '',
      countryId: '',
      cityId: '',
      categoryId: '',
      subCategoryId: '',
    })
    quill.root.innerHTML = ''
    setTimedMessage(message, setInfoMessage)
  }

  return (
    <>
      <h2 className={styles.actionTitle}>Crear Post</h2>
      <form className={styles.formCreate} onSubmit={handleSubmit}>
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
            type="file"
            name="image"
            id="image"
            value={formData.image}
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
          >
            <option value=""> </option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
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
          Crear
        </button>
        {errorMessage && <Message type="error" message={errorMessage} />}
        {infoMessage && <Message type="info" message={infoMessage} />}
      </form>
    </>
  )
}

export default function Dashboard({ authorized, data }) {
  const { posts } = data
  const [view, setView] = useState({ read: true, create: false })
  const [visiblePosts, setVisiblePosts] = useState(posts)

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Atracciones Judaicas</h1>
      <button
        className={
          view.read ? styles.actionButtonSelected : styles.actionButton
        }
        onClick={() => setView({ read: true, create: false })}
      >
        Mostar Posts
      </button>
      <button
        className={
          view.create ? styles.actionButtonSelected : styles.actionButton
        }
        onClick={() => setView({ read: false, create: true })}
      >
        Crear Post
      </button>

      {view.read && (
        <ExistingPosts posts={visiblePosts} setVisiblePosts={setVisiblePosts} />
      )}
      {view.create && (
        <PostCreator setVisiblePosts={setVisiblePosts} data={data} />
      )}
    </AdminLayout>
  )
}

export async function getStaticProps() {
  const posts = await prisma.post.findMany()
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

  const data = { posts, categories, subCategories, countries, cities }

  return {
    props: {
      authorized: true,
      data: JSON.parse(JSON.stringify(data)),
    },
  }
}
