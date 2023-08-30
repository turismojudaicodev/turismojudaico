// NPM
import { useEffect, useState } from 'react'
// Local
import { getContent, postContent } from 'lib/api'
// Components
import AdminLayout from '@/components/AdminLayout'
import DashboardTableCountries from '@/components/DashboardTableCountries'
import {
  InputColor,
  InputImage,
  InputNumber,
  InputText,
  Textarea,
} from '@/components/DashboardComponents'
import AdminButtonLoader from '@/components/AdminButtonLoader'
import Message from '@/components/Message'
import Notification, { NotificationLoading } from '@/components/Notification'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function ExistingContent({ setVisibleCountries, visibleCountries }) {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <DashboardTableCountries
        table={visibleCountries}
        setVisibleTable={setVisibleCountries}
      />
    </div>
  )
}

function Form({ setVisibileCountries }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCountrySubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    const country = Object.fromEntries(new FormData(ev.target))
    const response = await postContent('/api/content/countries', country)
    setIsLoading(false)
    const { message, error, data } = response
    if (error) return setErrorMessage(error)
    setVisibileCountries((prev) =>
      prev.concat({ ...country, codigo: data.insertId })
    )
    setInfoMessage(message)
    document.getElementById('country-form').reset()
  }

  return (
    <div>
      <form onSubmit={handleCountrySubmit} id="country-form">
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className={styles.formCreate}>
            <InputText label="País en español" name="nombre" />
            <Textarea label="Descripción A en español" name="descripcionA" />
            <Textarea label="Descripción B en español" name="descripcionB" />
          </div>
          <div className={styles.formCreate}>
            <InputText label="País en inglés" name="nombre_en" />
            <Textarea label="Descripción A en inglés" name="descripcionA_en" />
            <Textarea label="Descripción B en inglés" name="descripcionB_en" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <InputColor label="Color1" name="color1" />
          <InputColor label="Color2" name="color2" />
          <InputColor label="Color3" name="color3" />
        </div>
        <InputImage label="Mapa" name="mapa" />
        <div style={{ display: 'flex', gap: '1rem', marginBlock: '1rem' }}>
          <InputNumber label="Dolar" name="dolar" />
          <InputNumber label="Euro" name="euro" />
          <InputNumber label="GMT" name="gmt" min={-12} max={12} />
          <InputNumber label="Estado" name="estado" min={0} max={2} />
        </div>
        <AdminButtonLoader
          attrs={{ type: 'submit', style: { marginBottom: '1rem' } }}
          isLoading={isLoading}
        >
          Agregar
        </AdminButtonLoader>
      </form>
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
    </div>
  )
}

export default function Countries() {
  const [visibleCountries, setVisibileCountries] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setIsLoading(true)
    async function fetchCountries() {
      const { data, error } = await getContent('/api/content/countries')
      setIsLoading(false)
      if (error) {
        setErrorMessage(error)
        return
      }
      setVisibileCountries(data)
    }
    setIsLoading(true)
    fetchCountries()
  }, [])

  if (isLoading)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Países</h1>
        <NotificationLoading message="Cargando países..." />
      </AdminLayout>
    )

  if (errorMessage.length > 0)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Países</h1>
        <Message type="error" message={errorMessage} />
      </AdminLayout>
    )

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Países</h1>
      <Form
        visibleCountries={visibleCountries}
        setVisibileCountries={setVisibileCountries}
      />
      {visibleCountries.length > 0 && (
        <ExistingContent
          setVisibleCountries={setVisibileCountries}
          visibleCountries={visibleCountries}
        />
      )}
    </AdminLayout>
  )
}
