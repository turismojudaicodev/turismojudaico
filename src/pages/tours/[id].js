// NPM
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
// Local
import { getUniqueContent, postContent } from 'lib/api'
import { setImageSrc } from 'helpers'
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
import Image from 'next/image'
import { Carousel } from 'react-responsive-carousel'
// Styles
import styles from '@/styles/Citytours.module.css'
import utils from '@/styles/utils.module.css'
import 'react-responsive-carousel/lib/styles/carousel.min.css' // Carousel requires a loader

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
        style={{ objectFit: 'contain' }}
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
            {/* <div
              style={{ position: 'relative', width: '250px', height: '250px' }}
            >
              <Image
                src={setImageSrc(tour.imagen1, 'citytours')}
                alt={tour.imagen1}
                width={350}
                height={225}
              />
            </div> */}
            <div>
              {router.locale === 'es'
                ? tour?.descripcion?.split('\n\r').map((text, i) => (
                    <div style={{ marginBlock: '1.5em' }} key={i}>
                      {text.split('\n').map((text, i) => (
                        <p key={i} dangerouslySetInnerHTML={{ __html: text }} />
                      ))}
                    </div>
                  ))
                : tour?.descripcion_en?.split('\n\r').map((text, i) => (
                    <div style={{ marginBlock: '1.5em' }} key={i}>
                      {text.split('\n').map((text, i) => (
                        <p key={i} dangerouslySetInnerHTML={{ __html: text }} />
                      ))}
                    </div>
                  ))}
            </div>
          </div>
        )}
      </main>
    </Layout>
  )
}
