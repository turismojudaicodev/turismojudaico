// NPM
import { useState } from 'react'
import { useQuill } from 'react-quilljs'
// Local
import { prisma } from 'lib/prisma'
import { updateUniqueContent } from 'lib/api'
// Components
import AdminLayout from '@/components/AdminLayout'
import AdminButtonLoader from '@/components/AdminButtonLoader'
import Notification from '@/components/Notification'
import Image from 'next/image'
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
  const postEntries = await prisma.postEntry.findMany({ where: { postId } })
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
    post,
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

function PostForm({ title, prefix, formData, setFormData, quill, quillRef }) {
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

export default function Post({ data }) {
  const { postEntries, post } = data
  const postId = post.id
  const englishPost = postEntries.find((post) => post.locale === 'en')
  const spanishPost = postEntries.find((post) => post.locale === 'es')

  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [spanishFormData, setSpanishFormData] = useState({
    title: spanishPost.title,
    description: spanishPost.description,
    image: spanishPost.image,
    active: spanishPost.active,
    locale: spanishPost.locale,
    content: spanishPost.content,
  })
  const [englishFormData, setEnglishFormData] = useState({
    title: englishPost.title,
    description: englishPost.description,
    image: englishPost.image,
    active: englishPost.active,
    locale: englishPost.locale,
    content: englishPost.content,
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

    const spPost = {
      ...spanishFormData,
      content: spanishQuill.root.innerHTML,
      id: spanishPost.id,
    }

    const enPost = {
      ...englishFormData,
      content: englishQuill.root.innerHTML,
      id: englishPost.id,
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
      spPost.image = data.secure_url
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
      enPost.image = data.secure_url
    }

    const res = await updateUniqueContent(
      '/api/content/posts',
      postId.toString(),
      { spPost, enPost }
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
      <h2 className={styles.actionTitle}>Editar Post {postId}</h2>
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
          <PostForm
            title="Versión en español"
            prefix="sp"
            formData={spanishFormData}
            setFormData={setSpanishFormData}
            quill={spanishQuill}
            quillRef={spanishQuillRef}
          />
          <PostForm
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
