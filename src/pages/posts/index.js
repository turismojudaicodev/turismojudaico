// NPM
import { useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
// Local
import { prisma } from 'lib/prisma'
import { fetchStrapi } from 'lib/api'
import { handleError } from 'lib/errors'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import CardsContainer from '@/components/CardsContainer'
import Message from '@/components/Message'
import ButtonLoader from '@/components/ButtonLoader'
// Styles
import styles from '@/styles/Posts.module.css'
import utils from '@/styles/utils.module.css'

export async function getStaticProps({ locale }) {
  const posts = await prisma.post.findMany()
  const countries = await prisma.country.findMany()
  const categories = await prisma.category.findMany()
  const filterOptions = { countries, categories }

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'posts'])),
      posts: JSON.parse(JSON.stringify(posts)),
      filterOptions: JSON.parse(JSON.stringify(filterOptions)),
    },
  }
}

export default function Content({ posts, filterOptions }) {
  const [filters, setFilters] = useState({
    post: '',
    country: '',
    city: '',
    category: '',
    subCategory: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { locale } = useRouter()
  const { t } = useTranslation(['posts', 'common'])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))

    let queryParams = `?locale=${locale}`
    const filters = []

    if (formData.post)
      filters.push(['filters[title][$containsi]', `${formData.post}`])
    if (formData.country)
      filters.push(['filters[country][name][$eq]', `${formData.country}`])
    if (formData.city)
      filters.push(['filters[city][name][$eq]', `${formData.city}`])
    if (formData.category)
      filters.push(['filters[category][name][$eq]', `${formData.category}`])
    if (formData.subCategory)
      filters.push([
        'filters[subCategory][name][$eq]',
        `${formData.subCategory}`,
      ])

    if (filters.length > 0) {
      filters.forEach((filter, index) => {
        queryParams += `&${filter[0]}[${index}]=${filter[1]}`
      })
    }

    try {
      const { data, error } = await fetchStrapi('posts', queryParams)
      if (error) handleError(error)
      setPosts(data)
    } catch (error) {
      setErrorMessage(error.message)
    }
    setIsLoading(false)
  }

  const updateCountry = (ev) => {
    const countryName = ev.target.value
    setFilters((prev) => ({
      ...prev,
      country: countryName,
    }))
  }

  const updateCategory = (ev) => {
    const cateogryName = ev.target.value
    setFilters((prev) => ({
      ...prev,
      cateogry: cateogryName,
    }))
  }

  return (
    <>
      <Head>
        <title>{t('head.title', { ns: 'posts' })}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <div>
            <h1 className={utils.bigTitle}>
              {t('body.posts.title', { ns: 'posts' })}
            </h1>
            <div className={styles.searchedContentContainer}>
              {errorMessage ? (
                <Message type="error" message={errorMessage} />
              ) : (posts.length === 0 && isLoading) || isLoading ? (
                <LoadingIndicator />
              ) : posts.length > 0 ? (
                <CardsContainer
                  cardsName="posts"
                  cards={posts}
                  linkText={t('cardsContainerText', { ns: 'common' })}
                />
              ) : (
                <Message type="info" message={t('body.alerts.noContent')} />
              )}
            </div>
          </div>
          <div>
            <h2 className={utils.bigTitle}>
              {t('body.filter', { ns: 'posts' })}
            </h2>
            <form onSubmit={handleSubmit} className={utils.form}>
              <div>
                <label htmlFor="post">
                  {t('body.form.title', { ns: 'posts' })}
                </label>
                <input
                  type="text"
                  name="post"
                  className={utils.input}
                  placeholder={t('body.form.placeholder')}
                ></input>
              </div>
              <div>
                <label htmlFor="country">
                  {t('body.form.country', { ns: 'posts' })}
                </label>
                <select
                  id="country"
                  name="country"
                  className={utils.input}
                  onChange={updateCountry}
                >
                  <option value="">-</option>
                  {filterOptions.countries.map((country) => (
                    <option value={country.name} key={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="city">
                  {t('body.form.city', { ns: 'posts' })}
                </label>
                <select id="city" name="city" className={utils.input}>
                  <option value="">-</option>
                  {filters.country &&
                    filters.country.cities.data.map((city) => (
                      <option value={city.name} key={city.id}>
                        {city.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label htmlFor="category">
                  {t('body.form.category', { ns: 'posts' })}
                </label>
                <select
                  id="category"
                  name="category"
                  className={utils.input}
                  onChange={updateCategory}
                >
                  <option value="">-</option>
                  {filterOptions.categories.map((category) => (
                    <option value={category.name} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="subCategory">
                  {t('body.form.subCategory', { ns: 'posts' })}
                </label>
                <select
                  id="subCategory"
                  name="subCategory"
                  className={utils.input}
                >
                  <option value="">-</option>
                  {currentCategory &&
                    currentCategory.subCategories.data.map((subCategory) => (
                      <option value={subCategory.name} key={subCategory.id}>
                        {subCategory.name}
                      </option>
                    ))}
                </select>
              </div>
              <button className={utils.button} type="submit">
                {t('body.form.submit', { ns: 'posts' })}
              </button>
            </form>
          </div>
        </main>
      </Layout>
    </>
  )
}
