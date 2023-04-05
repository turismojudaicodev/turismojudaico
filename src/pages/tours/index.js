// NPM
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
// Local
import { fetchStrapi } from 'lib/api'
import { handleError } from 'lib/errors'
import { prisma } from 'lib/prisma'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import Message from '@/components/Message'
import CardsContainer from '@/components/CardsContainer'
import LoadingIndicator from '@/components/LoadingIndicator'
// Styles
import styles from '@/styles/Citytours.module.css'
import utils from '@/styles/utils.module.css'

export async function getStaticProps({ locale }) {
  const tours = await prisma.tour.findMany()
  const countries = await prisma.country.findMany()

  return {
    props: {
      ...(await serverSideTranslations(locale, ['citytours', 'common'])),
      tours: JSON.parse(JSON.stringify(tours)),
      countries: JSON.parse(JSON.stringify(countries)),
    },
  }
}

export default function Citytours({ tours, countries }) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { locale } = useRouter()
  const { t } = useTranslation(['citytours', 'common'])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)

    let queryParams = `?locale=${locale}`

    const formData = Object.fromEntries(new FormData(ev.target))
    const filters = []

    if (formData.tour)
      filters.push(['filters[title][$containsi]', `${formData.tour}`])
    if (formData.country)
      filters.push(['filters[country][name][$eq]', `${formData.country}`])

    if (filters.length > 0) {
      filters.forEach((filter, index) => {
        queryParams += `&${filter[0]}[${index}]=${filter[1]}`
      })
    }

    try {
      const { data, error } = await fetchStrapi('tours', queryParams)
      if (error) handleError(error)
      setTours(data)
    } catch (error) {
      setErrorMessage(error.message)
    }
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
            <h1 className={utils.bigTitle}>City Tours</h1>
            {errorMessage ? (
              <Message type="error" message={errorMessage} />
            ) : (tours.length === 0 && isLoading) || isLoading ? (
              <LoadingIndicator />
            ) : tours.length > 0 ? (
              <CardsContainer
                cardsName="tours"
                cards={tours}
                linkText={t('cardsContainerText', { ns: 'common' })}
              />
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
              <div>
                <label htmlFor="tour">
                  {t('body.form.title', { ns: 'citytours' })}
                </label>
                <input
                  type="text"
                  name="tour"
                  className={utils.input}
                  placeholder={t('body.form.placeholder', { ns: 'citytours' })}
                ></input>
              </div>
              <div>
                <label htmlFor="country">
                  {t('body.form.country', { ns: 'citytours' })}
                </label>
                <select id="country" name="country" className={utils.input}>
                  <option value="">-</option>
                  {countries.map((country) => (
                    <option value={country.name} key={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className={utils.button} type="submit">
                {t('body.form.submit', { ns: 'citytours' })}
              </button>
            </form>
          </div>
        </main>
      </Layout>
    </>
  )
}
