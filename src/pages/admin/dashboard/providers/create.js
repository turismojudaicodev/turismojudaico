// NPM
import { useEffect, useState } from 'react'
// Local
import { getContent, postContent } from 'lib/api'
// Components
import AdminLayout from '@/components/AdminLayout'
import Notification, { NotificationLoading } from '@/components/Notification'
import AdminButtonLoader from '@/components/AdminButtonLoader'
import {
  InputEmail,
  InputNumber,
  InputTelephone,
  InputText,
  Select,
} from '@/components/DashboardComponents'
import Message from '@/components/Message'
import Link from 'next/link'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function ProviderForm({ data }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null)

  const handleSubmit = async (ev) => {
    ev.preventDefault()

    setIsLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))

    const response = await postContent('/api/content/proivders', formData)
    const { message, error } = response
    setIsLoading(false)
    if (error) {
      setErrorMessage(error)
      return
    }
    setInfoMessage(message)
    document.getElementById('provider-form').reset()
  }

  return (
    <form onSubmit={handleSubmit} id="provider-form">
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <InputText label="Nombre" name="nombre" required />
        <InputEmail label="Mail de contacto" name="mailcontacto" />
        <InputText label="Contacto" name="contacto" />
        <InputTelephone label="Teléfono" name="telefono" />
        <InputEmail label="Mail reservas" name="mailreservas" />
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Select
            label="País"
            name="pais"
            options={data.countries}
            required
            attrs={{ onChange: (ev) => setSelectedCountry(ev.target.value) }}
          />
          <Select
            label="Ciudad"
            name="ciudad"
            options={data?.cities?.filter(
              (city) => city.pais == selectedCountry
            )}
            required
          />
        </div>
        <InputNumber label="Estado" name="estado" min={0} max={2} required />
        <AdminButtonLoader
          attrs={{ type: 'submit', style: { width: 'fit-content' } }}
          isLoading={isLoading}
        >
          Crear
        </AdminButtonLoader>
      </div>
    </form>
  )
}

export default function ProviderCreator() {
  const [errorMessage, setErrorMessage] = useState('')
  const [data, setData] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data: countries, error: countriesError } = await getContent(
        '/api/content/countries?reduced=1&active=1'
      )
      const { data: cities, error: citiesError } = await getContent(
        '/api/content/cities?reduced=1&active=1'
      )
      setIsLoading(false)
      if (countriesError || citiesError) {
        setErrorMessage(
          `Error del servidor: ${countriesError ?? ''} ${citiesError ?? ''}`
        )
        return
      }
      setData({
        countries,
        cities,
      })
    }
    setIsLoading(true)
    fetchData()
  }, [])

  if (errorMessage.length > 0) {
    return (
      <AdminLayout>
        <h3 className={styles.languageTitle}>Agregar Proveedor</h3>
        <Message type="error" message={errorMessage} />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h3 className={utils.bigTitle}>Proveedores</h3>
      <div style={{ marginBlock: '2rem' }}>
        <Link href="/admin/dashboard/providers" className={styles.actionButton}>
          Mostar Proveedores
        </Link>
        <Link href="" className={styles.actionButtonSelected}>
          Agregar Proveedor
        </Link>
      </div>
      {isLoading ? (
        <NotificationLoading message="Cargando datos" />
      ) : (
        <ProviderForm data={data} />
      )}
    </AdminLayout>
  )
}
