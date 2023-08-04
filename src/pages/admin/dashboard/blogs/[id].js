// NPM
import { useEffect, useState } from 'react'
import { useQuill } from 'react-quilljs'
// Local
import { prisma } from 'lib/prisma'
import { updateUniqueContent } from 'lib/api'
// Components
import AdminLayout from '@/components/AdminLayout'
import Notification from '@/components/Notification'
import AdminButtonLoader from '@/components/AdminButtonLoader'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'
import 'quill/dist/quill.snow.css' // quill snow theme
import Image from 'next/image'

export async function getStaticPaths() {
  const blogs = await prisma.blogEntry.findMany({ where: { locale: 'es' } })
  const paths = blogs.map((blog) => ({
    params: { id: blog.blogId.toString() },
  }))
  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps(context) {
  const blogId = Number(context.params.id)
  const blogs = await prisma.blogEntry.findMany({ where: { blogId } })
  return {
    props: {
      blogId,
      entries: JSON.parse(JSON.stringify(blogs)),
    },
  }
}

function BlogForm({ title, prefix, formData, setFormData, quill, quillRef }) {
  const [previewSource, setPreviewSource] = useState(formData.image || '')
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

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(formData.content)
    }
  }, [quill])

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

export default function Blog({ blogId, entries }) {
  const englishBlog = entries.find((blog) => blog.locale === 'en')
  const spanishBlog = entries.find((blog) => blog.locale === 'es')

  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [spanishFormData, setSpanishFormData] = useState({
    title: spanishBlog.title,
    description: spanishBlog.description,
    image: spanishBlog.image,
    active: spanishBlog.active,
    locale: spanishBlog.locale,
    content: spanishBlog.content,
  })
  const [englishFormData, setEnglishFormData] = useState({
    title: englishBlog.title,
    description: englishBlog.description,
    image: englishBlog.image,
    active: englishBlog.active,
    locale: englishBlog.locale,
    content: englishBlog.content,
  })

  let { quill: spanishQuill, quillRef: spanishQuillRef } = useQuill({
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

  const handleUpdate = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    setInfoMessage('')
    setErrorMessage('')

    const spBlog = {
      ...spanishFormData,
      content: spanishQuill.root.innerHTML,
      id: spanishBlog.id,
    }

    const enBlog = {
      ...englishFormData,
      content: englishQuill.root.innerHTML,
      id: englishBlog.id,
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

    const res = await updateUniqueContent(
      '/api/content/blogs',
      blogId.toString(),
      { spBlog, enBlog }
    )

    setIsLoading(false)
    const { message, error } = res
    if (error) {
      setErrorMessage(error)
      return
    }
    setInfoMessage(message)
  }

  return (
    <AdminLayout>
      <h2 className={styles.actionTitle}>Editar Blog</h2>
      {errorMessage && (
        <Notification
          notification={errorMessage}
          setNotification={setErrorMessage}
          type="error"
        />
      )}
      {infoMessage && (
        <Notification
          notification={infoMessage}
          setNotification={setInfoMessage}
        />
      )}
      <form onSubmit={handleUpdate}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <BlogForm
            title="Versión en español"
            prefix="sp"
            formData={spanishFormData}
            setFormData={setSpanishFormData}
            quill={spanishQuill}
            quillRef={spanishQuillRef}
          />
          <BlogForm
            title="Versión en inglés"
            prefix="en"
            formData={englishFormData}
            setFormData={setEnglishFormData}
            quill={englishQuill}
            quillRef={englishQuillRef}
          />
        </div>
        <AdminButtonLoader isLoading={isLoading}>Confirmar</AdminButtonLoader>
      </form>
    </AdminLayout>
  )
}
