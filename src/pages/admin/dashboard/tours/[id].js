// NPM
import { useEffect, useState } from 'react'
import { useQuill } from 'react-quilljs'
// Local
import { prisma } from 'lib/prisma'
import { updateUniqueContent } from 'lib/api'
import { uploadImage } from 'lib/cloudinary'
// Components
import AdminLayout from '@/components/AdminLayout'
import AdminButtonLoader from '@/components/AdminButtonLoader'
import Image from 'next/image'
import Notification from '@/components/Notification'
import DeleteIcon from 'public/icons/delete.svg'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'
import 'quill/dist/quill.snow.css' // quill snow theme

export async function getStaticPaths() {
  const tours = await prisma.tourEntry.findMany()
  const paths = tours.map((tour) => ({ params: { id: tour.id.toString() } }))

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps(context) {
  const tourId = Number(context.params.id)

  const tour = await prisma.tour.findUnique({ where: { id: tourId } })
  const spTour = await prisma.tourEntry.findFirst({
    where: { tourId, locale: 'es' },
  })
  const enTour = await prisma.tourEntry.findFirst({
    where: { tourId, locale: 'en' },
  })

  const posts = await prisma.post.findMany()
  const countries = await prisma.country.findMany()

  const data = { tour, spTour, enTour, posts, countries }

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
  }
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

export default function Tour({ setVisibleTours, data: configData }) {
  console.log({ configData })
  const [formData, setFormData] = useState({
    title: configData.spTour.title,
    description: configData.spTour.description,
    image: configData.spTour.image,
    active: configData.spTour.active,
    locale: 'es',
  })
  const [englishFormData, setEnglishFormData] = useState({
    title: configData.enTour.title,
    description: configData.enTour.description,
    image: configData.enTour.image,
    active: configData.enTour.active,
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

    const { error, message } = await updateUniqueContent(
      '/api/content/tours',
      configData.tour.id,
      { spTour, enTour }
    )
    setIsLoading(false)
    if (error) {
      setErrorMessage(errorMessage)
      return
    }
    // setVisibleTours((prev) => [...prev, data])

    setInfoMessage(message)
  }

  return (
    <AdminLayout>
      <h2 className={styles.actionTitle}>Crear Tour</h2>
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
            setNotification={setInfoMessage}
          />
        )}
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
        <AdminButtonLoader isLoading={isLoading}>Actualizar</AdminButtonLoader>
      </form>
    </AdminLayout>
  )
}
