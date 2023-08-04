// NPM
import { useState } from 'react'
import { useQuill } from 'react-quilljs'
// Local
import { postContent } from 'lib/api'
import { prisma } from 'lib/prisma'
import { uploadImage } from 'lib/cloudinary'
// Components
import AdminLayout from '@/components/AdminLayout'
import Notification from '@/components/Notification'
import Image from 'next/image'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'
import 'quill/dist/quill.snow.css' // quill snow theme
import DashboardTable from '@/components/DashboardTable'
import AdminButtonLoader from '@/components/AdminButtonLoader'

function ExistingPosts({ posts, setVisiblePosts }) {
  return (
    <>
      <h2 className={styles.actionTitle}>Atracciones</h2>
      <DashboardTable
        table={posts}
        setVisibleTable={setVisiblePosts}
        extraCols={{
          countryId: true,
          cityId: true,
          categoryId: true,
          subCategoryId: true,
        }}
        idAlias="postId"
      />
    </>
  )
}

function PostForm({ title, prefix, formData, setFormData, quillRef }) {
  const [previewSource, setPreviewSource] = useState('')
  const [fileInput, setFileInput] = useState('')

  const handleImageChange = (ev) => {
    const file = ev.target.files[0]
    if (!file) {
      setPreviewSource('')
      setFileInput('')
      return
    }
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
      setFormData((prev) => ({ ...prev, image: reader.result }))
    }
    setFileInput(ev.target.value)
  }

  return (
    <div>
      <h3 className={styles.languageTitle}>{title}</h3>
      <div className={styles.formCreate}>
        <div>
          <label className={utils.inputRequired} htmlFor={`${prefix}_title`}>
            Título
          </label>
          <input
            type="text"
            name={`${prefix}_title`}
            id={`${prefix}_title`}
            value={formData.title}
            onChange={(ev) =>
              setFormData((value) => ({ ...value, title: ev.target.value }))
            }
            className={styles.input}
          ></input>
        </div>
        <div>
          <label
            className={utils.inputRequired}
            htmlFor={`${prefix}_description`}
          >
            Descripción
          </label>
          <textarea
            type="text"
            name={`${prefix}_description`}
            id={`${prefix}_description`}
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
          <label htmlFor={`${prefix}_image`}>Imagen de portada</label>
          <input
            type="file"
            name={`${prefix}_image`}
            id={`${prefix}_image`}
            onChange={handleImageChange}
            value={fileInput}
          />
          {previewSource && (
            <Image
              src={previewSource}
              alt="Imagen de portada"
              width={200}
              height={200}
              style={{ marginTop: '.5rem' }}
            />
          )}
        </div>
        <div>
          <label className={utils.inputRequired}>Contenido</label>
          <div>
            <div ref={quillRef} />
          </div>
        </div>
        <div>
          <label htmlFor={`${prefix}_active`}>Visible</label>
          <input
            style={{ width: '25px' }}
            type="checkbox"
            name={`${prefix}_active`}
            id={`${prefix}_active`}
            value={formData.active}
            defaultChecked
            onChange={() =>
              setFormData((value) => ({ ...value, active: !value.active }))
            }
            className={styles.input}
          ></input>
        </div>
      </div>
    </div>
  )
}

const FORMDATA_DEFAULT = {
  title: '',
  description: '',
  image: '',
  active: true,
  locale: 'es',
}

function PostCreator({ setVisiblePosts, data: configData }) {
  const [formData, setFormData] = useState(FORMDATA_DEFAULT)
  const [englishFormData, setEnglishFormData] = useState({
    ...FORMDATA_DEFAULT,
    locale: 'en',
  })
  const [postData, setPostData] = useState({
    countryId: null,
    cityId: null,
    categoryId: null,
    subCategoryId: null,
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  let { quill: englishQuill, quillRef: englishQuillRef } = useQuill({
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
    setIsLoading(true)

    const htmlContent = quill.root.innerHTML
    const englsihHtmlContent = englishQuill.root.innerHTML
    const spPost = {
      ...formData,
      content: htmlContent,
    }
    const enPost = {
      ...englishFormData,
      content: englsihHtmlContent,
    }

    const currentFormData = new FormData(ev.target)
    const spImage = currentFormData.get('sp_image')
    const enImage = currentFormData.get('en_image')

    const spUploadedImage = await uploadImage(spImage)
    const enUploadedImage = await uploadImage(enImage)

    spPost.image = spUploadedImage
    enPost.image = enUploadedImage

    console.log(postData, spPost, enPost)
    const response = await postContent('/api/content/posts/new', {
      post: postData,
      spPost,
      enPost,
    })
    const { message, error } = response
    setIsLoading(false)
    if (error) {
      setErrorMessage(error)
      return
    }
    setFormData(FORMDATA_DEFAULT)
    setEnglishFormData({ ...FORMDATA_DEFAULT, locale: 'en' })
    quill.root.innerHTML = ''
    englishQuill.root.innerHTML = ''
    setPostData({
      countryId: null,
      cityId: null,
      categoryId: null,
      subCategoryId: null,
    })
    // setVisiblePosts((prev) => [...prev, data])

    setInfoMessage(message)
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
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <PostForm
          title="Post en español"
          formData={formData}
          prefix="sp"
          quillRef={quillRef}
          setFormData={setFormData}
        />
        <PostForm
          title="Post en inglés"
          formData={englishFormData}
          prefix="en"
          quillRef={englishQuillRef}
          setFormData={setEnglishFormData}
        />
      </div>
      <div
        style={{
          width: '25%',
          marginInline: 'auto',
          marginBottom: '1rem',
        }}
      >
        <div>
          <label htmlFor="country">País</label>
          <select
            id="country"
            name="country"
            className={styles.input}
            onChange={(ev) =>
              setPostData((prev) => ({ ...prev, countryId: ev.target.value }))
            }
          >
            <option value=""> </option>
            {configData.countries.map((country) => (
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
              setPostData((prev) => ({ ...prev, cityId: ev.target.value }))
            }
          >
            <option value=""> </option>
            {configData.cities.map(
              (city) =>
                postData.countryId === city.country.id.toString() && (
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
              setPostData((prev) => ({ ...prev, categoryId: ev.target.value }))
            }
          >
            <option value=""> </option>
            {configData.categories.map((category) => (
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
              setPostData((prev) => ({
                ...prev,
                subCategoryId: ev.target.value,
              }))
            }
          >
            <option value=""> </option>
            {configData.subCategories.map(
              (subCategory) =>
                postData.categoryId === subCategory.category.id.toString() && (
                  <option value={subCategory.id} key={subCategory.id}>
                    {subCategory.name}
                  </option>
                )
            )}
          </select>
        </div>
      </div>
      <AdminButtonLoader attrs={{ type: 'submit' }} isLoading={isLoading}>
        Crear
      </AdminButtonLoader>
    </form>
  )
}

export default function Dashboard({ data }) {
  const { postEntries } = data
  const [view, setView] = useState({ read: true, create: false })
  const [visiblePosts, setVisiblePosts] = useState(postEntries)

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
  const postEntries = await prisma.postEntry.findMany()
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

  const data = {
    posts,
    postEntries,
    categories,
    subCategories,
    countries,
    cities,
  }

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
  }
}
