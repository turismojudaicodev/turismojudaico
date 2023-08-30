// NPM
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
// Local
import { getUniqueContent, postContent } from 'lib/api'
// Components
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'
import ButtonLoader from '@/components/ButtonLoader'
import {
  InputDate,
  InputEmail,
  InputNumber,
  InputTelephone,
  InputText,
  Textarea,
} from '@/components/DashboardComponents'
// Styles
import styles from '@/styles/Citytours.module.css'
import utils from '@/styles/utils.module.css'

export default function CityTour() {
  const router = useRouter()

  const [i18n, setI18n] = useState({})

  const [tour, setTour] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  useEffect(() => {
    async function fetchLocale() {
      const translation = await import(
        `public/locales/${router.locale}/citytours.json`
      )
      setI18n(translation)
    }
    fetchLocale()
  }, [router.locale])

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await getUniqueContent(
        '/api/content/tours',
        router.query.id
      )
      setIsLoading(false)
      if (error) return setErrorMessage(error)
      setTour(data)
    }
    setIsLoading(true)
    if (router.isReady) fetchData()
  }, [router.isReady])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsFormLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))

    const { message, error } = await postContent('/api/reservation', formData)
    setIsFormLoading(false)

    if (error) return setErrorMessage(error)
    setInfoMessage(message)
  }

  return (
    <Layout>
      <main className={`${utils.container} ${styles.main}`}>
        <div>
          <h2>{i18n?.body?.reservation?.title}</h2>
          <form className={utils.form} onSubmit={handleSubmit}>
            <InputText
              label={i18n?.body?.reservation?.fullName}
              name="fullName"
              required
            />
            <InputNumber
              label={i18n?.body?.reservation?.passengers}
              name="passengers"
              min={1}
              required
            />
            <InputEmail
              label={i18n?.body?.reservation?.email}
              name="email"
              required
            />
            <InputTelephone
              label={i18n?.body?.reservation?.telephone}
              name="telephone"
              required
            />
            <InputDate
              label={i18n?.body?.reservation?.desiredDate}
              name="desiredDate"
              required
            />

            <Textarea label={i18n?.body?.reservation?.message} name="message" />
            <ButtonLoader isLoading={isFormLoading} attrs={{ type: 'submit' }}>
              {i18n?.body?.reservation?.submit}
            </ButtonLoader>
          </form>
          <div className={utils.messageContainer}>
            {errorMessage && <Message type="error" message={errorMessage} />}
            {infoMessage && <Message type="info" message={infoMessage} />}
          </div>
        </div>
        {(!tour && !isLoading) || isLoading ? (
          <LoadingIndicator />
        ) : (
          <div>
            <h2 className={utils.bigTitle}>
              {router.locale === 'es' ? tour.nombre : tour.nombre_en}
            </h2>
            <p>
              {router.locale === 'es' ? tour.descripcion : tour.descripcion_en}
            </p>
            <div
              style={{ position: 'relative', width: '250px', height: '250px' }}
            >
              <p>Aca va la imagen</p>
            </div>
          </div>
        )}
      </main>
    </Layout>
  )
}
