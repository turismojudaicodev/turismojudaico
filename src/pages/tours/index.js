// NPM
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
// Local
import { getContent } from 'lib/api'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import Message from '@/components/Message'
import LoadingIndicator from '@/components/LoadingIndicator'
import { TourCard } from '@/components/TourCard'
import { InputText, Select } from '@/components/DashboardComponents'
// Styles
import styles from '@/styles/Citytours.module.css'
import utils from '@/styles/utils.module.css'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['citytours', 'common'])),
      locale,
    },
  }
}

export default function Citytours({ locale }) {
  const [tours, setTours] = useState([])
  const [countries, setCountries] = useState([])
  const [isLoading, setIsLoading] = useState({
    tours: false,
    countries: false,
  })
  const [isFormLoading, setIsFormLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { t } = useTranslation(['citytours', 'common'])

  useEffect(() => {
    async function fetchData() {
      const { data: tours, error: toursError } = await getContent(
        '/api/content/tours'
      )
      setIsLoading((value) => ({ ...value, tours: false }))
      setTours(tours)
      const { data: countries, error: countriesError } = await getContent(
        '/api/content/countries'
      )
      setIsLoading((value) => ({ ...value, countries: false }))
      if (toursError || countriesError) {
        return setErrorMessage(`${toursError ?? ''} ${countriesError ?? ''}`)
      }
      setCountries(countries)
    }
    setIsLoading({ tours: true, countries: true })
    fetchData()
  }, [])

  const handleSubmit = async (ev) => {
    ev.preventDefault()

    setIsFormLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))

    alert(`${formData.tour} ${formData.country}`)

    setIsFormLoading(false)
  }

  return (
    <>
      <Head>
        <title>{t('head.title', { ns: 'citytours' })}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <div className={styles.toursContainer}>
            <h1 className={utils.bigTitle}>City Tours</h1>
            {errorMessage ? (
              <Message type="error" message={errorMessage} />
            ) : (tours.length === 0 && isLoading.tours) || isLoading.tours ? (
              <LoadingIndicator />
            ) : tours.length > 0 ? (
              tours.map((tour) => (
                <TourCard tour={tour} locale={locale} key={tour.codigo} />
              ))
            ) : (
              <Message
                type="info"
                message={t('body.alerts.noContent', { ns: 'citytours' })}
              />
            )}
          </div>
          <div>
            <h2 className={utils.bigTitle}>
              {t('body.filter', { ns: 'citytours' })}
            </h2>
            <form onSubmit={handleSubmit} className={utils.form}>
              <InputText
                label={t('body.form.title', { ns: 'citytours' })}
                name="tour"
                attrs={{
                  className: utils.input,
                  placeholder: t('body.form.placeholder', { ns: 'citytours' }),
                }}
              />
              <Select
                label={t('body.form.country', { ns: 'citytours' })}
                name="country"
                options={countries}
                attrs={{ className: utils.input }}
              />

              <button className={utils.button} type="submit">
                {isFormLoading
                  ? 'Cargando...'
                  : t('body.form.submit', { ns: 'citytours' })}
              </button>
            </form>
          </div>
        </main>
      </Layout>
    </>
  )
}
