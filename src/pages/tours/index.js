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
import { InputText } from '@/components/DashboardComponents'
import ButtonLoader from '@/components/ButtonLoader'
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
  const [isLoading, setIsLoading] = useState(false)
  const [toursOffset, setToursOffset] = useState(0)
  const [isFiltersLoading, setIsFiltersLoading] = useState(false)
  const [data, setData] = useState({
    countries: [],
    toursCount: 0,
  })
  const [errorMessage, setErrorMessage] = useState('')

  const { t } = useTranslation(['citytours', 'common'])

  useEffect(() => {
    async function fetchData() {
      const { data: tours, error: toursError } = await getContent(
        `/api/content/tours?estado=1&limit=5&offset=${toursOffset ?? 0}`
      )
      setIsLoading(false)
      setTours(tours)
      if (toursError) return setErrorMessage(toursError)
      setToursOffset((v) => v + 5)
      const { data: countries, error: countriesError } = await getContent(
        '/api/content/tours/countries?estado=1'
      )
      setIsFiltersLoading(false)
      if (countriesError) return setErrorMessage(countriesError)
      setData((prev) => ({ ...prev, countries }))
    }
    setIsFiltersLoading(true)
    setIsLoading(true)
    fetchData()
  }, [])

  const handleLoadMore = async () => {
    setIsLoading(true)
    const { data, error } = await getContent(
      `/api/content/tours?estado=1&limit=5&offset=${toursOffset ?? 0}`
    )
    setIsLoading(false)
    if (error) return setErrorMessage(error)
    setToursOffset((v) => v + 5)
    setTours(data)
  }

  const handleSubmit = async (countryId) => {
    setIsLoading(true)
    const { data, error } = await getContent(
      `/api/content/tours/from?pais=${countryId}`
    )
    if (error) return setErrorMessage(error)
    setTours(data)
    setIsLoading(false)
  }

  return (
    <>
      <Head>
        <title>{t('head.title', { ns: 'citytours' })}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <div>
            <h2 className={utils.bigTitle}>
              {t('body.filter', { ns: 'citytours' })}
            </h2>
            {isFiltersLoading ? (
              <LoadingIndicator />
            ) : (
              <div>
                <ul style={{ listStyle: 'none' }}>
                  {data.countries.map((country) => (
                    <li key={country.codigo}>
                      <button
                        onClick={() => handleSubmit(country.codigo)}
                        className={styles.filterLink}
                      >
                        {locale === 'es' ? country.nombre : country.nombre_en} (
                        {country.tours})
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className={styles.toursContainer}>
            <h1 className={utils.bigTitle}>City Tours</h1>
            {errorMessage ? (
              <Message type="error" message={errorMessage} />
            ) : (tours.length === 0 && isLoading) || isLoading ? (
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
            {!isLoading && (
              <>
                <ButtonLoader
                  isLoading={isLoading}
                  attrs={{ onClick: handleLoadMore }}
                >
                  {locale === 'es' ? 'Cargar siguientes' : 'Load more'}
                </ButtonLoader>
              </>
            )}
          </div>
        </main>
      </Layout>
    </>
  )
}
