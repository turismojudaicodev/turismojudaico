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
  const tours = await prisma.tour.findMany()
  const paths = tours.map((tour) => ({ params: { id: tour.id.toString() } }))

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps(context) {
  const tourId = Number(context.params.id)
  const tour = await prisma.tour.findUnique({ where: { id: tourId } })

  const posts = await prisma.post.findMany()
  const data = { tour, posts }

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
  }
}

export default function TourCreator({ data: configData }) {
  const { tour } = configData
  const [formData, setFormData] = useState({
    title: tour.title,
    description: tour.description,
    image: tour.image,
    active: tour.active,
    locale: tour.locale,
    posts: tour.posts,
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [previewSource, setPreviewSource] = useState('')

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

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(tour.content)
    }
  }, [quill])

  // const previewFile = (file) => {
  //   const reader = new FileReader()
  //   reader.readAsDataURL(file)
  //   reader.onloadend = () => {
  //     setPreviewSource(reader.result)
  //   }
  // }

  const handleUpdate = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)

    const res = await updateUniqueContent(
      '/api/content/tours',
      tour.id.toString(),
      {
        ...formData,
        content: quill.root.innerHTML,
      }
    )
    setIsLoading(false)
    const { message, error } = res
    if (error) return setTimedMessage(error, setErrorMessage)
    setTimedMessage(message, setInfoMessage)
  }

  return (
    <AdminLayout>
      <h2 className={styles.actionTitle}>Editar Tour</h2>
      <form className={styles.formCreate} onSubmit={handleUpdate}>
        <div>
          <label className={utils.inputRequired} htmlFor="title">
            Idioma
          </label>
          <select
            className={styles.input}
            name="locale"
            id="locale"
            value={formData.locale}
            onChange={(ev) => {
              setFormData((prev) => ({ ...prev, locale: ev.target.value }))
            }}
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
          </select>
        </div>
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
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <input
              type="text"
              placeholder="Url de la imagen"
              name="image"
              id="image"
              value={formData.image}
              onChange={(ev) =>
                setFormData((value) => {
                  // previewFile(ev.target.files[0])
                  return { ...value, image: ev.target.value }
                })
              }
              className={styles.input}
            ></input>
            {/* {previewSource && (
              <Image
                src={previewSource}
                alt="Imagen de portada"
                height={200}
                width={275}
                style={{ objectFit: 'contain' }}
              />
            )} */}
          </div>
        </div>
        <div>
          <label className={utils.inputRequired}>Contenido</label>
          <div>
            <div ref={quillRef} />
          </div>
        </div>
        {/* <div>
          <label htmlFor="posts">Posts relacionados</label>
          <div>
            <select
              id="posts"
              name="posts"
              className={styles.input}
              onChange={(ev) => {
                setFormData((value) => {
                  if (
                    value?.posts?.includes(ev.target.value) ||
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
              {formData?.posts?.map((post) => {
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
                            setFormData((prev) => ({
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
        </div> */}
        <div>
          <label htmlFor="active">Visible</label>
          <input
            style={{ width: '25px' }}
            type="checkbox"
            name="active"
            id="active"
            value={formData.active}
            defaultChecked={formData.active}
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
    </AdminLayout>
  )
}
