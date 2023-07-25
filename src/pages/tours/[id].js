// NPM
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
// Local
import { prisma } from 'lib/prisma'
import { postContent } from 'lib/api'
import { setTimedMessage } from 'helpers'
// Components
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'
// Styles
import styles from '@/styles/Citytours.module.css'
import utils from '@/styles/utils.module.css'
import StrapiImage from '@/components/StrapiImage'
import ButtonLoader from '@/components/ButtonLoader'

export async function getStaticPaths() {
  const tours = await prisma.tourEntry.findMany()
  const paths = tours.map((tour) => ({
    params: { id: tour.id.toString() },
  }))

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params: { id } }) {
  const tour = await prisma.tour.findUnique({ where: { id: Number(id) } })

  return {
    props: {
      tour: JSON.parse(JSON.stringify(tour)),
    },
  }
}

export default function CityTour({ tour }) {
  const router = useRouter()
  const { id } = router.query

  const [i18n, setI18n] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    passengers: '',
    email: '',
    telephone: '',
    desiredDate: '',
    message: '',
  })

  useEffect(() => {
    async function fetchLocale() {
      const translation = await import(
        `public/locales/${router.locale}/citytours.json`
      )
      setI18n(translation)
    }
    fetchLocale()
  }, [router.locale])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsFormLoading(true)

    const reservationData = {
      ...formData,
      tour: id,
    }

    try {
      const { message, error } = await postContent(
        '/api/reservation',
        reservationData
      )
      if (error) {
        console.log(error)
        setIsFormLoading(false)
        return setTimedMessage(error, setErrorMessage, 3000)
      }
      setFormData({
        fullName: '',
        passengers: '',
        email: '',
        telephone: '',
        desiredDate: '',
        message: '',
      })
      setTimedMessage(message, setInfoMessage, 3000)
    } catch (error) {
      console.log('catch error', error)
      console.dir(error)
      setTimedMessage(error.message, setErrorMessage, 3000)
    }
    setIsFormLoading(false)
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
                value={formData.fullName}
                onChange={(ev) =>
                  setFormData((prev) => ({
                    ...prev,
                    fullName: ev.target.value,
                  }))
                }
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
                value={formData.passengers}
                onChange={(ev) =>
                  setFormData((prev) => ({
                    ...prev,
                    passengers: ev.target.value,
                  }))
                }
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
                value={formData.email}
                onChange={(ev) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: ev.target.value,
                  }))
                }
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
                value={formData.telephone}
                onChange={(ev) =>
                  setFormData((prev) => ({
                    ...prev,
                    telephone: ev.target.value,
                  }))
                }
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
                value={formData.desiredDate}
                onChange={(ev) =>
                  setFormData((prev) => ({
                    ...prev,
                    desiredDate: ev.target.value,
                  }))
                }
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
                value={formData.message}
                onChange={(ev) =>
                  setFormData((prev) => ({
                    ...prev,
                    message: ev.target.value,
                  }))
                }
                className={utils.input}
              ></textarea>
            </div>
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
            <h2 className={utils.bigTitle}>{tour.title}</h2>
            <p>{tour.description}</p>
            <div
              style={{ position: 'relative', width: '250px', height: '250px' }}
            >
              <StrapiImage />
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: tour.content }}
              className={utils.htmlContent}
            />
          </div>
        )}
      </main>
    </Layout>
  )
}
