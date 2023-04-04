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
  const blogs = await prisma.blog.findMany()
  const paths = blogs.map((blog) => ({ params: { id: blog.id.toString() } }))

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps(context) {
  const blogId = Number(context.params.id)
  const blog = await prisma.blog.findUnique({ where: { id: blogId } })
  return {
    props: {
      blog: JSON.parse(JSON.stringify(blog)),
    },
  }
}

export default function Blog({ blog }) {
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
    title: blog.title,
    description: blog.description,
    image: blog.image,
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(blog.content)
    }
  }, [quill])

  const handleUpdate = async (ev) => {
    ev.preventDefault()

    const res = await updateUniqueContent(
      '/api/content/blogs',
      blog.id.toString(),
      {
        ...formData,
        content: quill.root.innerHTML,
      }
    )
    const { data, message, error } = res
    if (error) return setTimedMessage(error, setErrorMessage)
    setTimedMessage(message, setInfoMessage)
    console.log(data)
  }

  return (
    <AdminLayout>
      <h2 className={styles.actionTitle}>Crear Blog</h2>
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
            type="file"
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
        <button className={styles.submitButton} type="submit">
          Confirmar
        </button>
        {errorMessage && <Message type="error" message={errorMessage} />}
        {infoMessage && <Message type="info" message={infoMessage} />}
      </form>
    </AdminLayout>
  )
}
