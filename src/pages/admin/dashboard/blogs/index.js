// NPM
import { useState } from 'react'
import { useQuill } from 'react-quilljs'
// Local
import { postContent } from 'lib/api'
import { prisma } from 'lib/prisma'
import { setTimedMessage } from 'helpers'
// Components
import Image from 'next/image'
import AdminLayout from '@/components/AdminLayout'
import Message from '@/components/Message'
import DashboardTable from '@/components/DashboardTable'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'
import 'quill/dist/quill.snow.css' // quill snow theme

function ExistingBlogs({ blogs, setVisisbleBlogs }) {
  console.log(blogs)
  return (
    <>
      <h2 className={styles.actionTitle}>Blogs</h2>
      <DashboardTable
        table={blogs}
        setVisibleTable={setVisisbleBlogs}
        idAlias="blogId"
      />
    </>
  )
}

function BlogForm({ title, prefix, formData, setFormData, quillRef }) {
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
          <label>
            <span className={utils.inputRequired}>Título</span>
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
          </label>
        </div>
        <div>
          <label>
            <span className={utils.inputRequired}>Descripción</span>
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
          </label>
        </div>
        <div>
          <label>
            <span style={{ display: 'block', marginBlock: '.5rem' }}>
              Imagen de portada
            </span>
            <input
              type="file"
              name={`${prefix}_image`}
              id={`${prefix}_image`}
              onChange={handleImageChange}
              value={fileInput}
            />
          </label>
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
          <p className={utils.inputRequired}>Contenido</p>
          <div className={styles.quillContainer}>
            <div>
              <div ref={quillRef} />
            </div>
          </div>
        </div>
        <div>
          <label>
            <span>Visible</span>
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
          </label>
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

function BlogCreator({ setVisisbleBlogs }) {
  const [formData, setFormData] = useState(FORMDATA_DEFAULT)
  const [englishFormData, setEnglishFormData] = useState({
    ...FORMDATA_DEFAULT,
    locale: 'en',
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
    const spanishHtmlContent = quill.root.innerHTML
    const englishHtmlContent = englishQuill.root.innerHTML
    const spBlog = {
      ...formData,
      content: spanishHtmlContent,
    }

    const enBlog = {
      ...englishFormData,
      content: englishHtmlContent,
    }

    const currentFormData = new FormData(ev.target)
    const spImage = currentFormData.get('sp_image')
    const enImage = currentFormData.get('en_image')

    if (spImage.size > 0) {
      const fd = new FormData()
      fd.append('file', spImage)
      fd.append('upload_preset', 'tj_local')
      const data = await fetch(
        'https://api.cloudinary.com/v1_1/paiput/image/upload',
        {
          method: 'POST',
          body: fd,
        }
      ).then((r) => r.json())
      spBlog.image = data.secure_url
    }
    if (enImage.size > 0) {
      const fd = new FormData()
      fd.append('file', enImage)
      fd.append('upload_preset', 'tj_local')
      const data = await fetch(
        'https://api.cloudinary.com/v1_1/paiput/image/upload',
        {
          method: 'POST',
          body: fd,
        }
      ).then((r) => r.json())
      enBlog.image = data.secure_url
    }

    const response = await postContent('/api/content/blogs', {
      spBlog,
      enBlog,
    })

    const { data, message, error } = response

    setIsLoading(false)

    if (error) return setTimedMessage(error, setErrorMessage)

    console.log('data', data)
    // setVisisbleBlogs((prev) => [...prev, data])
    setFormData(FORMDATA_DEFAULT)
    setEnglishFormData({ ...FORMDATA_DEFAULT, locale: 'en' })
    quill.root.innerHTML = ''
    englishQuill.root.innerHTML = ''
    setTimedMessage(message, setInfoMessage)
  }

  return (
    <form onSubmit={handleSubmit}>
      {infoMessage && <Message message={infoMessage} type="info" />}
      {errorMessage && <Message message={errorMessage} type="error" />}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <BlogForm
          title="Versión en español"
          prefix="sp"
          formData={formData}
          setFormData={setFormData}
          quillRef={quillRef}
        />
        <BlogForm
          title="Versión en inglés"
          prefix="en"
          formData={englishFormData}
          setFormData={setEnglishFormData}
          quillRef={englishQuillRef}
        />
      </div>
      <button
        type="submit"
        className={isLoading ? styles.submitButtonLoading : styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? 'Cargando...' : 'Crear blog'}
      </button>
    </form>
  )
}

export default function Dashboard({ blogs }) {
  const [view, setView] = useState({ read: true, create: false })
  const [visibleBlogs, setVisisbleBlogs] = useState(blogs)

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

      {view.read && (
        <ExistingBlogs
          blogs={visibleBlogs}
          setVisisbleBlogs={setVisisbleBlogs}
        />
      )}
      {view.create && <BlogCreator setVisisbleBlogs={setVisisbleBlogs} />}
    </AdminLayout>
  )
}

export async function getStaticProps() {
  const blogs = await prisma.blogEntry.findMany()

  return {
    props: {
      authorized: true,
      blogs: JSON.parse(JSON.stringify(blogs)),
    },
  }
}
