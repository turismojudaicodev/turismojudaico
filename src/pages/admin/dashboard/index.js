// NPM
import { useState } from 'react'
// Local
import { deleteContent, postContent } from 'lib/api'
// Components
import AdminLayout from '@/components/AdminLayout'
import Image from 'next/image'
import Notification from '@/components/Notification'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/DashboardIndex.module.css'
import dashboardStyles from '@/styles/Dashboard.module.css'

export default function Dashboard() {
  const [previewSource, setPreviewSource] = useState('')
  const [fileInput, setFileInput] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

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
    }
    setFileInput(ev.target.value)
  }

  const handleSliderFormSubmit = async (ev) => {
    ev.preventDefault()
    let data = {}
    const formData = new FormData(ev.target)
    data = { ...Object.fromEntries(formData) }

    const image = formData.get('image')

    if (image.size > 0) {
      const fd = new FormData()
      fd.append('file', image)
      fd.append('upload_preset', 'tj_local')
      const res = await fetch(
        'https://api.cloudinary.com/v1_1/paiput/image/upload',
        {
          method: 'POST',
          body: fd,
        }
      ).then((r) => r.json())
      data.url = res.secure_url
      data.publicId = res.public_id
    }

    const { message, error } = await postContent('/api/content/index', data)

    if (error) {
      setErrorMessage(error)
      return
    }

    setInfoMessage(message)

    document.getElementById('image-form').reset()
    setFileInput('')
    setPreviewSource('')
  }

  const handleSliderDelete = async (imageId, imageName) => {
    if (!confirm(`Desea borrar la imagen "${imageName}"`)) {
      return
    }
    const { message, error } = await deleteContent(
      '/api/content/index',
      imageId
    )
    if (error) {
      setErrorMessage(error)
      return
    }
    setInfoMessage(message)
  }

  return (
    <AdminLayout>
      {errorMessage && (
        <Notification
          notification={errorMessage}
          type="error"
          setNotification={setErrorMessage}
        />
      )}
      {infoMessage && (
        <Notification
          notification={infoMessage}
          setNotification={setInfoMessage}
        />
      )}
      <h1 className={utils.bigTitle}>Inicio</h1>
      <div>
        <h2>Imágenes del slider</h2>
        <div>
          {/* {currentImages?.length > 0 &&
            currentImages.map((image) => (
              <div key={image.id}>
                <p>{image.name}</p>
                <Image
                  src={image.url}
                  alt={image.name}
                  height={75}
                  width={125}
                />
                <Image
                  src="/icons/delete.svg"
                  height={25}
                  width={25}
                  style={{
                    background: '#b33',
                    borderRadius: '5px',
                    padding: '.25rem',
                    cursor: 'pointer',
                  }}
                  alt=""
                  onClick={() => handleSliderDelete(image.id, image.name)}
                />
              </div>
            ))} */}
        </div>
        <form
          onSubmit={handleSliderFormSubmit}
          id="image-form"
          className={styles.form}
        >
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <div>
              <label>
                <span>Título</span>
                <br />
                <input type="text" name="name" className={utils.input} />
              </label>
            </div>
            <div>
              <label>
                <span>Imagen</span>
                <br />

                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  value={fileInput}
                  onChange={handleImageChange}
                  className={utils.input}
                />
                {previewSource && (
                  <>
                    <br />
                    <Image
                      src={previewSource}
                      alt="Imagen"
                      width={200}
                      height={200}
                      style={{ marginTop: '.5rem' }}
                    />
                  </>
                )}
              </label>
            </div>
            <div>
              <label>
                <span>Sección</span>
                <br />
                <select name="section" className={utils.input}>
                  <option value="carousel">Carousel</option>
                  <option value="companies">Empresas</option>
                </select>
              </label>
            </div>
            <div>
              <label>
                <span>Descripción (opcional)</span>
                <br />
                <textarea
                  name="description"
                  className={utils.input}
                  style={{ maxHeight: '200px' }}
                />
              </label>
            </div>
          </div>
          <button type="submit" className={dashboardStyles.submitButton}>
            Agregar imagen
          </button>
        </form>
      </div>
      <div>
        <h2>Tours destacados</h2>
        <p>
          Para agregar tours a la sección de destacados en el menú &quot;City
          Tours&quot;
        </p>
      </div>
    </AdminLayout>
  )
}
