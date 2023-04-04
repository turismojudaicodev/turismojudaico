// NPM
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
// Local
import { fetchStrapi, postStrapi } from 'lib/api'
// Components
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'
// Styles
import styles from '@/styles/Citytours.module.css'
import utils from '@/styles/utils.module.css'
import StrapiImage from '@/components/StrapiImage'

export default function CityTour() {
  const router = useRouter()
  const { id } = router.query

  const [i18n, setI18n] = useState({})
  const [tour, setTour] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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
    if (!id) return
    async function fetchTour() {
      setIsLoading(true)
      try {
        const { data, error } = await fetchStrapi(`tours/${id}`)
        if (error) handleError(error)
        const htmlContent = await formatMarkDown(data.attributes.content)
        data.attributes.content = htmlContent
        setTour(data)
      } catch (error) {
        setErrorMessage(error.message)
      }
      setIsLoading(false)
    }
    fetchTour()
  }, [id])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const formData = Object.fromEntries(new FormData(ev.target))
    const reservationData = {
      ...formData,
      tour: id,
    }
    const response = await postStrapi('reservations', reservationData)
    console.log('res', response)
  }

  return (
    <Layout>
      <main className={`${utils.container} ${styles.main}`}>
        <div>
          <h2>{i18n?.body?.reservation?.title}</h2>
          <form className={utils.form} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className={utils.inputRequired}>
                {i18n?.body?.reservation?.fullName}
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className={utils.input}
              ></input>
            </div>
            <div>
              <label htmlFor="passengers" className={utils.inputRequired}>
                {i18n?.body?.reservation?.passengers}
              </label>
              <input
                type="number"
                id="passengers"
                name="passengers"
                min={1}
                className={utils.input}
              ></input>
            </div>
            <div>
              <label htmlFor="email" className={utils.inputRequired}>
                {i18n?.body?.reservation?.email}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={utils.input}
              ></input>
            </div>
            <div>
              <label htmlFor="telephone" className={utils.inputRequired}>
                {i18n?.body?.reservation?.telephone}
              </label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                className={utils.input}
              ></input>
            </div>
            <div>
              <label htmlFor="desiredDate" className={utils.inputRequired}>
                {i18n?.body?.reservation?.desiredDate}
              </label>
              <input
                type="date"
                id="desiredDate"
                name="desiredDate"
                className={utils.input}
              ></input>
            </div>
            <div>
              <label htmlFor="message">
                {i18n?.body?.reservation?.message}
              </label>
              <textarea
                id="message"
                name="message"
                className={utils.input}
              ></textarea>
            </div>
            <button type="submit" className={utils.button}>
              {i18n?.body?.reservation?.submit}
            </button>
          </form>
        </div>
        {errorMessage ? (
          <Message type="error" message={errorMessage} />
        ) : (!tour && !isLoading) || isLoading ? (
          <LoadingIndicator />
        ) : (
          <div>
            <h2 className={utils.bigTitle}>{tour.attributes.title}</h2>
            <p>{tour.attributes.description}</p>
            <div
              style={{ position: 'relative', width: '250px', height: '250px' }}
            >
              <StrapiImage />
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: tour.attributes.content }}
              className={utils.htmlContent}
            />
          </div>
        )}
      </main>
    </Layout>
  )
}
