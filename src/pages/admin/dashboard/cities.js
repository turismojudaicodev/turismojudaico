// NPM
import { useEffect, useState } from 'react'
// Local
import { getContent, postContent } from 'lib/api'
// Components
import AdminLayout from '@/components/AdminLayout'
import DashboardTableCities from '@/components/DashboardTableCities'
import {
  InputNumber,
  InputText,
  Select,
  Textarea,
} from '@/components/DashboardComponents'
import AdminButtonLoader from '@/components/AdminButtonLoader'
import Message from '@/components/Message'
import Notification, { NotificationLoading } from '@/components/Notification'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function ExistingContent({ visibleCities, setVisibileCities }) {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <DashboardTableCities
        table={visibleCities}
        setVisibleTable={setVisibileCities}
      />
    </div>
  )
}

function Form({ setVisibileCities, countries }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleCitySubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    const formData = Object.fromEntries(new FormData(ev.target))
    const response = await postContent('/api/content/cities', formData)
    setIsLoading(false)
    const { message, error, data } = response
    if (error) return setErrorMessage(error)
    // setVisibileCities((prev) => prev.concat({ ...formData, codigo: data.insertId }))
    setInfoMessage(message)
    document.getElementById('city-form').reset()
  }

  return (
    <div>
      <form onSubmit={handleCitySubmit} id="city-form">
        <div className={styles.formCreate}>
          <InputText label="Ciudad" name="nombre" required />
          <InputText label="Código de clima" name="codigoclima" />
          <Textarea label="Descripción" name="descripcion" />
          <Select label="País" name="pais" options={countries} required />
          <InputNumber label="Estado" name="estado" min={0} max={2} required />
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

export default function Cities() {
  const [countries, setCountries] = useState([])
  const [visibleCities, setVisibileCities] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setIsLoading(true)
    async function fetchCities() {
      const { data: countries, error: countriesError } = await getContent(
        '/api/content/countries?reduced=1&active=1'
      )
      const { data, error } = await getContent('/api/content/cities')
      setIsLoading(false)
      if (error || countriesError) {
        setErrorMessage(`Error: ${error ?? ''} ${countriesError ?? ''}`)
        return
      }
      setCountries(countries)
      setVisibileCities(data)
    }
    setIsLoading(true)
    fetchCities()
  }, [])

  if (isLoading)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Ciudades</h1>
        <NotificationLoading message="Cargando ciudades..." />
      </AdminLayout>
    )

  if (errorMessage.length > 0)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Ciudades</h1>
        <Message type="error" message={errorMessage} />
      </AdminLayout>
    )

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Ciudades</h1>
      <Form
        visibleCities={visibleCities}
        setVisibleCities={setVisibileCities}
        countries={countries}
      />
      {visibleCities.length > 0 && (
        <ExistingContent
          visibleCities={visibleCities}
          setVisibleCities={setVisibileCities}
        />
      )}
    </AdminLayout>
  )
}
