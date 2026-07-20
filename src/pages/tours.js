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
import TourCard from '@/components/TourCard'
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
  const TOUR_LIMIT = 9

  const [tours, setTours] = useState([])
  const [limit, setLimit] = useState(TOUR_LIMIT * 2)
  const [selectedCountry, setSelectedCountry] = useState(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isFiltersLoading, setIsFiltersLoading] = useState(false)

  const [data, setData] = useState({
    countries: [],
    totalTours: 0,
  })
  const [errorMessage, setErrorMessage] = useState('')

  const { t } = useTranslation(['citytours', 'common'])

  useEffect(() => {
    async function fetchData() {
      const { data: tours, error: toursError } = await getContent(
        `/api/content/tours?estado=1&limit=${TOUR_LIMIT}`
      )
      setIsLoading(false)
      setTours(tours)
      if (toursError) return setErrorMessage(toursError)
      const { data: countries, error: countriesError } = await getContent(
        '/api/content/tours/countries?estado=1'
      )
      setIsFiltersLoading(false)
      if (countriesError) return setErrorMessage(countriesError)
      setData((prev) => ({ ...prev, countries }))
      const { data: totalTours, error: totalToursError } = await getContent(
        `/api/content/tours/count?estado=1`
      )
      setData((prev) => ({ ...prev, totalTours: totalTours.total }))
      if (totalToursError) return setErrorMessage(totalToursError)
    }
    setIsFiltersLoading(true)
    setIsLoading(true)
    fetchData()
  }, [])

  const handleLoadMore = async () => {
    setIsLoading(true)
    const { data, error } = await getContent(
      `/api/content/tours?estado=1&limit=${limit}`
    )
    setIsLoading(false)
    if (error) return setErrorMessage(error)
    setLimit((v) => v + TOUR_LIMIT)
    setTours(data)
  }

  const handleFilterByCountry = async (countryId) => {
    setIsLoading(true)
    if (countryId === selectedCountry) {
      setSelectedCountry(null)
      const { data, error } = await getContent(
        `/api/content/tours?estado=1&limit=${limit}`
      )
      if (error) return setErrorMessage(error)
      setTours(data)
      setIsLoading(false)
      return
    }
    setSelectedCountry(countryId)
    // El /from se encarga solo de trear los que tienen estado=1
    const { data, error } = await getContent(
      `/api/content/tours/from?pais=${countryId}`
    )
    if (error) return setErrorMessage(error)
    setTours(data)
    setIsLoading(false)
  }

  const handleTextSearch = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    const formData = Object.fromEntries(new FormData(ev.target))
    const { nombre } = formData
    const { data, error } = await getContent(
      `/api/content/tours?estado=1&nombre=${nombre}`
    )
    if (error) return setErrorMessage(error)
    setTours(data)
    console.log(data)
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
                <form
                  style={{ marginBottom: '.5rem' }}
                  onSubmit={handleTextSearch}
                >
                  <InputText
                    name="nombre"
                    placeholder="Tour"
                    attrs={{ className: utils.input }}
                  />
                  <ButtonLoader
                    isLoading={isLoading}
                    attrs={{ style: { marginTop: '.25rem' }, type: 'submit' }}
                  >
                    {locale === 'es' ? 'Buscar' : 'Search'}
                  </ButtonLoader>
                </form>
                <ul style={{ listStyle: 'none' }}>
                  {data.countries.map((country) => (
                    <li key={`${country.codigo}-${country.nombre}`}>
                      <button
                        onClick={() => handleFilterByCountry(country.codigo)}
                        className={styles.filterLink}
                        style={{
                          backgroundColor:
                            selectedCountry === country.codigo
                              ? 'lightblue'
                              : '',
                        }}
                      >
                        {locale === 'es' ? country.nombre : country.nombre_en}
                        {/* ({country.tours}) */}
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
              <div className={styles.toursGrid}>
                {tours.map((tour) => (
                  <TourCard tour={tour} locale={locale} key={tour.codigo} />
                ))}
              </div>
            ) : (
              <Message
                type="info"
                message={t('body.alerts.noContent', { ns: 'citytours' })}
              />
            )}
            {!isLoading && selectedCountry === null && (
              <div>
                {tours.length < data.totalTours && (
                  <ButtonLoader
                    isLoading={isLoading}
                    attrs={{ onClick: handleLoadMore }}
                  >
                    {locale === 'es' ? 'Cargar siguientes' : 'Load more'}
                  </ButtonLoader>
                )}
                <p>
                  {locale === 'es' ? 'Mostrando' : 'Showing'} {tours.length}/
                  {data.totalTours}
                </p>
              </div>
            )}
          </div>
        </main>
      </Layout>
    </>
  )
}
