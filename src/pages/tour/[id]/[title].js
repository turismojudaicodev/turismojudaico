// NPM
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
// Local
import { getContent, postContent } from 'lib/api'
import { fixUrl, setImageSrc } from 'helpers'
// Components
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import Head from 'next/head'
import ButtonLoader from '@/components/ButtonLoader'
import {
  InputDate,
  InputEmail,
  InputNumber,
  InputTelephone,
  InputText,
  Textarea,
} from '@/components/DashboardComponents'
import Image from 'next/image'
import { Carousel } from 'react-responsive-carousel'
import Link from 'next/link'
import Notification from '@/components/Notification'
// Styles
import styles from '@/styles/Citytours.module.css'
import utils from '@/styles/utils.module.css'
import 'react-responsive-carousel/lib/styles/carousel.min.css' // Carousel requires a loader
import Message from '@/components/Message'

function SliderImage({ imgSrc, alt }) {
  return (
    <div
      style={{
        aspectRatio: '5/3',
        position: 'relative',
        border: '1px solid lightgray',
      }}
    >
      <Image
        alt={alt || 'Sin Imagen'}
        src={imgSrc}
        fill
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}

export default function CityTour() {
  const router = useRouter()

  const [i18n, setI18n] = useState({})

  const [tour, setTour] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [blockingError, setBlockingError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  useEffect(() => {
    async function fetchLocale() {
      const translation = await import(
        `public/locales/${router.locale}/citytours.json`
      )
      setI18n(translation)
    }
    if (tour.nombre && tour.nombre_en) {
      const encodedTourTitle =
        router.locale === 'es' ? fixUrl(tour?.nombre) : fixUrl(tour?.nombre_en)
      const newUrl = `/tour/${tour?.codigo}/${encodedTourTitle}`
      window.history.pushState({ path: newUrl }, '', newUrl)
    }
    fetchLocale()
  }, [router.locale, tour])

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await getContent(
        `/api/content/tours/${router.query.id}/${router.query.title}`
      )
      setIsLoading(false)
      if (error) return setBlockingError(error)
      setTour(data)
    }
    setIsLoading(true)
    if (router.isReady) fetchData()
  }, [router.isReady])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsFormLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))
    formData.citytour_nombre = tour.nombre

    const { message, error } = await postContent('/api/reservation', formData)
    setIsFormLoading(false)

    if (error) return setErrorMessage(error)
    setInfoMessage(message)
    document.getElementById('reservation-form').reset()
  }

  if (blockingError) {
    return (
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <Message message={blockingError} type="error" />
        </main>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>{isLoading ? 'Tour' : tour?.nombre || 'Tour'}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <div>
            <h2>{i18n?.body?.reservation?.title}</h2>
            <form
              className={utils.form}
              onSubmit={handleSubmit}
              id="reservation-form"
            >
              <InputText
                label={i18n?.body?.reservation?.fullName}
                name="contacto_nombre"
                required
              />
              <InputText
                label={i18n?.body?.reservation?.hometown}
                name="contacto_ciudad_origen"
              />
              <InputNumber
                label={i18n?.body?.reservation?.passengers}
                name="contacto_pasajeros"
                min={1}
                required
              />
              <InputEmail
                label={i18n?.body?.reservation?.email}
                name="contacto_mail"
                required
              />
              <InputTelephone
                label={i18n?.body?.reservation?.telephone}
                name="contacto_telefono"
                required
              />
              <InputDate
                label={i18n?.body?.reservation?.desiredDate}
                name="contacto_fecha"
                required
              />
              <Textarea
                label={i18n?.body?.reservation?.message}
                name="contacto_mensaje"
              />
              <ButtonLoader
                isLoading={isFormLoading}
                attrs={{ type: 'submit' }}
              >
                {i18n?.body?.reservation?.submit}
              </ButtonLoader>
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
          {(!tour && !isLoading) || isLoading ? (
            <LoadingIndicator />
          ) : (
            <div>
              <h2 className={utils.bigTitle}>
                {router.locale === 'es' ? tour.nombre : tour.nombre_en}
              </h2>
              <div style={{ borderBottom: '4px solid var(--clr-green)' }}>
                <Carousel
                  autoPlay
                  infiniteLoop
                  showStatus={false}
                  showThumbs={false}
                  dynamicHeight
                  width="100%"
                >
                  {tour.imagen1 && (
                    <SliderImage
                      imgSrc={setImageSrc(tour?.imagen1, 'citytours')}
                      alt={tour.imagen1}
                    />
                  )}
                  {tour.imagen2 && (
                    <SliderImage
                      imgSrc={setImageSrc(tour?.imagen2, 'citytours')}
                      alt={tour.imagen2}
                    />
                  )}
                  {tour.imagen3 && (
                    <SliderImage
                      imgSrc={setImageSrc(tour?.imagen3, 'citytours')}
                      alt={tour.imagen3}
                    />
                  )}
                  {tour.imagen4 && (
                    <SliderImage
                      imgSrc={setImageSrc(tour?.imagen4, 'citytours')}
                      alt={tour.imagen4}
                    />
                  )}
                </Carousel>
              </div>
              <Link
                href="#reservation-form"
                className={`${utils.button} ${styles.linkToReservation}`}
                style={{ marginTop: '1rem' }}
              >
                {router.locale === 'es' ? 'Reservar' : 'Book'}
              </Link>
              <div className={styles.content}>
                {router.locale === 'es'
                  ? tour?.descripcion?.split('\n\r').map((text, i) => (
                      <div style={{ marginBlock: '1.5em' }} key={i}>
                        {text.split('\n').map((text, i) => (
                          <p
                            key={i}
                            style={{ marginBlock: '1em' }}
                            dangerouslySetInnerHTML={{ __html: text }}
                          />
                        ))}
                      </div>
                    ))
                  : tour?.descripcion_en?.split('\n\r').map((text, i) => (
                      <div style={{ marginBlock: '1.5em' }} key={i}>
                        {text.split('\n').map((text, i) => (
                          <p
                            key={i}
                            style={{ marginBlock: '1em' }}
                            dangerouslySetInnerHTML={{ __html: text }}
                          />
                        ))}
                      </div>
                    ))}
              </div>
            </div>
          )}
        </main>
      </Layout>
    </>
  )
}
