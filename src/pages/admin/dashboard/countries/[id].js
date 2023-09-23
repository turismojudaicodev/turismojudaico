// NPM
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
// Local
import { getUniqueContent, updateUniqueContent } from 'lib/api'
// Components
import AdminLayout from '@/components/AdminLayout'
import Notification, { NotificationLoading } from '@/components/Notification'
import AdminButtonLoader from '@/components/AdminButtonLoader'
import {
  InputImage,
  InputNumber,
  InputText,
  Textarea,
  InputColor,
} from '@/components/DashboardComponents'
// Styles
import styles from '@/styles/Dashboard.module.css'

function CountryForm({ country }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <h3 className={styles.languageTitle}>Editar País {country?.codigo}</h3>
      <div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={styles.formCreate}>
            <InputText
              label="País en español"
              name="nombre"
              required
              defaultValue={country.nombre}
            />
            <Textarea
              label="Descripción A en español"
              name="descripcionA"
              defaultValue={country.descripcionA}
            />
            <Textarea
              label="Descripción B en español"
              name="descripcionB"
              defaultValue={country.descripcionB}
            />
          </div>
          <div className={styles.formCreate}>
            <InputText
              label="País en inglés"
              name="nombre_en"
              required
              defaultValue={country.nombre_en}
            />
            <Textarea
              label="Descripción A en inglés"
              name="descripcionA_en"
              defaultValue={country.descripcionA_en}
            />
            <Textarea
              label="Descripción B en inglés"
              name="descripcionB_en"
              defaultValue={country.descripcionB_en}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <InputColor
            label="Color1"
            name="color1"
            defaultValue={country.color1}
          />
          <InputColor
            label="Color2"
            name="color2"
            defaultValue={country.color2}
          />
          <InputColor
            label="Color3"
            name="color3"
            defaultValue={country.color3}
          />
        </div>
        <InputImage label="Mapa" name="mapa" />
        {country.mapa ? (
          <p>Imagen actual: {country.mapa}</p>
        ) : (
          <p>Sin imagen</p>
        )}
        <div style={{ display: 'flex', gap: '1rem', marginBlock: '1rem' }}>
          <InputNumber
            label="Dolar"
            name="dolar"
            defaultValue={country.dolar}
          />
          <InputNumber label="Euro" name="euro" defaultValue={country.euro} />
          <InputNumber
            label="GMT"
            name="gmt"
            min={-12}
            max={12}
            required
            defaultValue={country.gmt}
          />
          <InputNumber
            label="Estado"
            name="estado"
            min={0}
            max={2}
            required
            defaultValue={country.estado}
          />
        </div>
      </div>
    </div>
  )
}

export default function Country() {
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState('')
  const [country, setCountry] = useState({})
  const [infoMessage, setInfoMessage] = useState('')
  const [isDataLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchCountry() {
      const { data, error } = await getUniqueContent(
        '/api/content/countries',
        router.query.id
      )
      if (error) return setErrorMessage(error)
      setCountry(data)
      setIsLoading(false)
    }
    setIsLoading(true)
    if (router.isReady) fetchCountry()
  }, [router.isReady])

  const handleUpdate = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    setInfoMessage('')
    setErrorMessage('')

    const formData = Object.fromEntries(new FormData(ev.target))

    const res = await updateUniqueContent(
      '/api/content/countries',
      router.query.id.toString(),
      formData
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
      <h2 className={styles.actionTitle}>Editar País</h2>
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
      {isDataLoading && <NotificationLoading />}
      <form onSubmit={handleUpdate}>
        <CountryForm country={country} />
        <AdminButtonLoader isLoading={isDataLoading}>
          Confirmar
        </AdminButtonLoader>
      </form>
    </AdminLayout>
  )
}
