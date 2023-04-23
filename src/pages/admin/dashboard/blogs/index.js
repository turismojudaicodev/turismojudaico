// NPM
import { useState } from 'react'
import { useQuill } from 'react-quilljs'
// Local
import { postContent, deleteContent } from 'lib/api'
import { formatDate } from 'helpers'
import { prisma } from 'lib/prisma'
import { setTimedMessage } from 'helpers'
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

function ExistingBlogs({ blogs, setVisisbleBlogs }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const handleDelete = async (blogId) => {
    const result = await deleteContent('/api/content/blogs', blogId)
    const { message, error } = result
    if (error) return setTimedMessage(error, setErrorMessage)
    setTimedMessage(message, setInfoMessage)
    setVisisbleBlogs((prev) => prev.filter((blog) => blog.id !== blogId))
  }

  return (
    <>
      <h2 className={styles.actionTitle}>Blogs</h2>
      <div>
        {blogs.map((blog) => (
          <div className={styles.entryCard} key={blog.id}>
            <div className={styles.entryTextContainer}>
              <h3>{blog.title}</h3>
              <p>{blog.description}</p>
              <p>{formatDate(blog.createdAt)}</p>
            </div>
            <div className={styles.entryButtonsContainer}>
              <Link
                href={`/admin/dashboard/blogs/${blog.id}`}
                className={styles.editButton}
              >
                <Image src={EditIcon} alt="Edit Icon" height={16} width={16} />
              </Link>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(blog.id)}
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
        <div className={utils.messageContainer}>
          {errorMessage && <Message type="error" message={errorMessage} />}
          {infoMessage && <Message type="info" message={infoMessage} />}
        </div>
      </div>
    </>
  )
}

function BlogCreator({ setVisisbleBlogs }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    active: true,
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

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    const htmlContent = quill.root.innerHTML
    const blog = {
      ...formData,
      content: htmlContent,
    }
    const response = await postContent('/api/content/blogs', blog)
    const { data, message, error } = response

    setIsLoading(false)
    if (error) return setTimedMessage(error, setErrorMessage)

    setVisisbleBlogs((prev) => [...prev, data])
    setFormData({
      title: '',
      description: '',
      image: '',
      active: true,
    })
    quill.root.innerHTML = ''
    setTimedMessage(message, setInfoMessage)
  }

  return (
    <>
      <h2 className={styles.actionTitle}>Crear Blog</h2>
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
          <label htmlFor="active">Visible</label>
          <input
            style={{ width: '25px' }}
            type="checkbox"
            name="active"
            id="active"
            value={formData.active}
            defaultChecked
            onChange={() =>
              setFormData((value) => ({ ...value, active: !active }))
            }
            className={styles.input}
          ></input>
        </div>
        <button className={styles.submitButton} type="submit">
          {isLoading ? 'Creando...' : 'Crear'}
        </button>
        {errorMessage && <Message type="error" message={errorMessage} />}
        {infoMessage && <Message type="info" message={infoMessage} />}
      </form>
    </>
  )
}

export default function Dashboard({ authorized, blogs }) {
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
  const blogs = await prisma.blog.findMany()

  return {
    props: {
      authorized: true,
      blogs: JSON.parse(JSON.stringify(blogs)),
    },
  }
}
