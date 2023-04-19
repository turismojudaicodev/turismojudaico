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

function ExistingTours({ tours, setVisibleTours }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const handleDelete = async (tourId) => {
    const result = await deleteContent('/api/content/tours', tourId)
    const { message, error } = result
    if (error) return setTimedMessage(error, setErrorMessage)
    setTimedMessage(message, setInfoMessage)
    setVisibleTours((prev) => prev.filter((tour) => tour.id !== tourId))
  }

  return (
    <>
      <h2 className={styles.actionTitle}>Tours</h2>
      <div>
        {tours.map((tour) => (
          <div className={styles.entryCard} key={tour.id}>
            <div className={styles.entryTextContainer}>
              <h3>{tour.title}</h3>
              <p>{tour.description}</p>
              <p>{formatDate(tour.createdAt)}</p>
            </div>
            <div className={styles.entryButtonsContainer}>
              <Link
                href={`/admin/dashboard/tours/${tour.id}`}
                className={styles.editButton}
              >
                <Image src={EditIcon} alt="Edit Icon" height={16} width={16} />
              </Link>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(tour.id)}
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

function TourCreator({ setVisibleTours, data: configData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    active: true,
    posts: [],
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { posts } = configData

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
    const tour = {
      ...formData,
      content: htmlContent,
    }
    const response = await postContent('/api/content/tours/new', tour)
    const { data, message, error } = response
    setIsLoading(false)
    if (error) return setTimedMessage(error, setErrorMessage)

    setVisibleTours((prev) => [...prev, data])

    setFormData({
      title: '',
      description: '',
      image: '',
      active: true,
      posts: [],
    })
    quill.root.innerHTML = ''
    setTimedMessage(message, setInfoMessage)
  }

  return (
    <>
      <h2 className={styles.actionTitle}>Crear Tour</h2>
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
            onChange={(ev) =>
              setFormData((value) => ({ ...value, active: !active }))
            }
            className={styles.input}
          ></input>
        </div>
        <button className={styles.submitButton} type="submit">
          {isLoading ? 'Cargando...' : 'Crear'}
        </button>
        {errorMessage && <Message type="error" message={errorMessage} />}
        {infoMessage && <Message type="info" message={infoMessage} />}
      </form>
    </>
  )
}

export default function Dashboard({ authorized, data }) {
  const { tours } = data
  const [view, setView] = useState({ read: true, create: false })
  const [visibleTours, setVisibleTours] = useState(tours)

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Tours</h1>
      <button
        className={
          view.read ? styles.actionButtonSelected : styles.actionButton
        }
        onClick={() => setView({ read: true, create: false })}
      >
        Mostar Tours
      </button>
      <button
        className={
          view.create ? styles.actionButtonSelected : styles.actionButton
        }
        onClick={() => setView({ read: false, create: true })}
      >
        Crear Tour
      </button>

      {view.read && (
        <ExistingTours tours={visibleTours} setVisibleTours={setVisibleTours} />
      )}
      {view.create && (
        <TourCreator setVisibleTours={setVisibleTours} data={data} />
      )}
    </AdminLayout>
  )
}

export async function getStaticProps() {
  const tours = await prisma.tour.findMany({
    include: {
      posts: true,
    },
  })
  const posts = await prisma.post.findMany()

  const data = { tours, posts }

  return {
    props: {
      authorized: true,
      data: JSON.parse(JSON.stringify(data)),
    },
  }
}
