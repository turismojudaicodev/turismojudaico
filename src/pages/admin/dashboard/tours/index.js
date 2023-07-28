// NPM
import { useEffect, useState } from 'react'
import { useQuill } from 'react-quilljs'
// Local
import { postContent, updateUniqueContent } from 'lib/api'
import { setTimedMessage } from 'helpers'
import { prisma } from 'lib/prisma'
import { uploadImage } from 'lib/cloudinary'
// Components
import AdminLayout from '@/components/AdminLayout'
import Message from '@/components/Message'
import Image from 'next/image'
import DashboardTable from '@/components/DashboardTable'
import Notification from '@/components/Notification'
import DeleteIcon from 'public/icons/delete.svg'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'
import 'quill/dist/quill.snow.css' // quill snow theme

function ExistingTours({ tours, tourEntries, setVisisbleTours }) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [featuredToursCounter, setFeaturedToursCounter] = useState(0)

  useEffect(() => {
    const initialFeatured = tours.filter(
      (tour) => tour.featured === true
    ).length
    setFeaturedToursCounter(initialFeatured)
  }, [])

  const handleUpdateFeatured = async (ev) => {
    setInfoMessage('')
    setErrorMessage('')

    if (ev.target.checked && featuredToursCounter === 3) {
      alert('Puede seleccionar máximo 3 tours para destacar')
      ev.target.checked = false
      return
    }

    setIsLoading(true)
    if (!ev.target.checked) {
      setFeaturedToursCounter((value) => value - 1)
      const { message, error } = await updateUniqueContent(
        '/api/content/tours/featured',
        ev.target.value,
        { featured: false }
      )
      if (error) setErrorMessage(error)
      if (message) setInfoMessage(message)
    } else {
      setFeaturedToursCounter((value) => value + 1)
      const { message, error } = await updateUniqueContent(
        '/api/content/tours/featured',
        ev.target.value,
        { featured: true }
      )
      if (error) setErrorMessage(error)
      if (message) setInfoMessage(message)
    }
    setIsLoading(false)
  }

  return (
    <>
      <h2 className={styles.actionTitle}>Tours</h2>
      <DashboardTable
        table={tourEntries}
        setVisibleTable={setVisisbleTours}
        idAlias="tourId"
      />
      <h2 className={styles.actionTitle}>
        Tours para destacar en la página principal
      </h2>
      <table
        style={{
          border: '1px solid #aaa',
          borderSpacing: '0',
        }}
      >
        <thead>
          <tr>
            <th style={{ border: '1px solid #aaa', padding: '.25em' }}>Id</th>
            <th style={{ border: '1px solid #aaa', padding: '.25em' }}>
              Título
            </th>
            <th style={{ border: '1px solid #aaa', padding: '.25em' }}>
              Destacado
            </th>
          </tr>
        </thead>
        <tbody>
          {tourEntries
            .filter((tour) => tour.locale === 'es')
            .map((tour) => (
              <tr key={tour.id}>
                <td style={{ border: '1px solid #aaa', padding: '.25em' }}>
                  {tour.tourId}
                </td>
                <td style={{ border: '1px solid #aaa', padding: '.25em' }}>
                  {tour.title}
                </td>
                <td style={{ border: '1px solid #aaa', padding: '.25em' }}>
                  <input
                    type="checkbox"
                    value={tour.tourId}
                    id={`tour_${tour.id}`}
                    onChange={handleUpdateFeatured}
                    defaultChecked={tour.Tour.featured}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
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
    </>
  )
}

function TourForm({ title, prefix, formData, setFormData, quillRef }) {
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

function TourCreator({ setVisibleTours, data: configData }) {
  const [formData, setFormData] = useState(FORMDATA_DEFAULT)
  const [englishFormData, setEnglishFormData] = useState({
    ...FORMDATA_DEFAULT,
    locale: 'en',
  })
  const [tourData, setTourData] = useState({
    countryId: null,
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
    const englishHtmlContent = englishQuill.root.innerHTML
    const spTour = {
      ...formData,
      content: htmlContent,
    }
    const enTour = {
      ...englishFormData,
      content: englishHtmlContent,
    }

    const currentFormData = new FormData(ev.target)
    const spImage = currentFormData.get('sp_image')
    const enImage = currentFormData.get('en_image')

    const spUploadedImage = await uploadImage(spImage)
    const enUploadedImage = await uploadImage(enImage)

    spTour.image = spUploadedImage
    enTour.image = enUploadedImage

    console.log(tourData, spTour, enTour)

    const response = await postContent('/api/content/tours/new', {
      tour: tourData,
      spTour,
      enTour,
    })
    const { data, message, error } = response
    setIsLoading(false)
    if (error) return setTimedMessage(error, setErrorMessage)

    // setVisibleTours((prev) => [...prev, data])

    setFormData(FORMDATA_DEFAULT)
    setEnglishFormData({ ...FORMDATA_DEFAULT, locale: 'en' })
    quill.root.innerHTML = ''
    englishQuill.root.innerHTML = ''
    setTimedMessage(message, setInfoMessage)
  }

  return (
    <>
      <h2 className={styles.actionTitle}>Crear Tour</h2>
      <form onSubmit={handleSubmit}>
        {errorMessage && <Message type="error" message={errorMessage} />}
        {infoMessage && <Message type="info" message={infoMessage} />}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <TourForm
            title="Versión en español"
            prefix="sp"
            formData={formData}
            quillRef={quillRef}
            setFormData={setFormData}
          />
          <TourForm
            title="Versión en inglés"
            prefix="en"
            formData={englishFormData}
            quillRef={englishQuillRef}
            setFormData={setEnglishFormData}
          />
        </div>
        <div
          style={{ width: '25%', marginInline: 'auto', marginBottom: '1rem' }}
        >
          <label htmlFor="country">País</label>
          <select
            name="country"
            id="country"
            className={styles.input}
            onChange={(ev) =>
              setTourData((value) => ({ ...value, countryId: ev.target.value }))
            }
          >
            <option value=""> </option>
            {configData.countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ width: '25%', marginInline: 'auto' }}>
          <label htmlFor="posts">Posts relacionados</label>
          <div>
            <select
              id="posts"
              name="posts"
              className={styles.input}
              onChange={(ev) => {
                setTourData((value) => {
                  if (
                    value.posts.includes(ev.target.value) ||
                    ev.target.value === ''
                  )
                    return value
                  return {
                    ...value,
                    posts: [...value.posts, ev.target.value],
                  }
                })
              }}
            >
              <option value=""> </option>
              {posts.map((post) => (
                <option value={post.id} key={post.id}>
                  {post.title}
                </option>
              ))}
            </select>
            <ul style={{ padding: '1rem 0 0 1.75rem' }}>
              {tourData.posts.map((post) => {
                return posts.map((fetchedPost) => {
                  if (fetchedPost.id == post) {
                    return (
                      <li
                        key={post}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '.5rem',
                          marginBottom: '.25em',
                        }}
                      >
                        <button
                          className={styles.deleteButton}
                          onClick={(ev) =>
                            setTourData((prev) => ({
                              ...prev,
                              posts: prev.posts.filter(
                                (prevValue) => prevValue !== post
                              ),
                            }))
                          }
                        >
                          <Image
                            src={DeleteIcon}
                            height={16}
                            width={16}
                            alt="delte icon"
                          />
                        </button>
                        <span>{fetchedPost.title}</span>
                      </li>
                    )
                  }
                })
              })}
            </ul>
          </div>
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

export default function Dashboard({ data }) {
  const { tourEntries } = data
  const [view, setView] = useState({ read: true, create: false })
  const [visibleTours, setVisibleTours] = useState(tourEntries)

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
        <ExistingTours
          tours={data.tours}
          tourEntries={visibleTours}
          setVisibleTours={setVisibleTours}
        />
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
  const tourEntries = await prisma.tourEntry.findMany({
    include: {
      Tour: true,
    },
  })
  const posts = await prisma.post.findMany()
  const countries = await prisma.country.findMany()

  const data = { tours, tourEntries, posts, countries }

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
  }
}
