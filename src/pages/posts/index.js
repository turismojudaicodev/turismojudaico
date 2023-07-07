// NPM
import { useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
// Local
import { prisma } from 'lib/prisma'
import { getFilteredContent } from 'lib/api'
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
  const cities = await prisma.city.findMany({ include: { country: true } })
  const subCategories = await prisma.subCategory.findMany({
    include: { category: true },
  })

  const filterOptions = { countries, cities, categories, subCategories }

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
  const [visiblePosts, setVisiblePosts] = useState(posts)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { t } = useTranslation(['posts', 'common'])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)

    try {
      console.log(filters)
      const { data, error } = await getFilteredContent(
        '/api/content/posts',
        filters
      )
      console.log('data', data)
      if (error) return setErrorMessage(error)
      setVisiblePosts(data)
      setFilters({
        post: '',
        country: '',
        city: '',
        category: '',
        subCategory: '',
      })
    } catch (error) {
      setErrorMessage(error.message)
    }
    setIsLoading(false)
  }

  const updateFilters = (ev) => {
    const filterName = ev.target.name
    const filterValue = ev.target.value
    setFilters((prev) => ({
      ...prev,
      [`${filterName}`]: filterValue,
    }))
  }

  return (
    <>
      <Head>
        <title>{t('head.title', { ns: 'posts' })}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <div className={styles.blogsContainer}>
            <h1 className={utils.bigTitle}>
              {t('body.posts.title', { ns: 'posts' })}
            </h1>
            <div className={styles.searchedContentContainer}>
              {errorMessage ? (
                <Message type="error" message={errorMessage} />
              ) : (visiblePosts.length === 0 && isLoading) || isLoading ? (
                <LoadingIndicator />
              ) : visiblePosts.length > 0 ? (
                <CardsContainer
                  cardsName="posts"
                  cards={visiblePosts}
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
                  id="post"
                  className={utils.input}
                  placeholder={t('body.form.placeholder')}
                  onChange={updateFilters}
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
                  onChange={updateFilters}
                >
                  <option value="">-</option>
                  {filterOptions.countries.map((country) => (
                    <option value={country.id} key={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="city">
                  {t('body.form.city', { ns: 'posts' })}
                </label>
                <select
                  id="city"
                  name="city"
                  className={utils.input}
                  onChange={updateFilters}
                >
                  <option value="">-</option>
                  {filters.country &&
                    filterOptions.cities
                      .filter(
                        (city) => city.country.id.toString() === filters.country
                      )
                      .map((city) => (
                        <option value={city.id} key={city.id}>
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
                  onChange={updateFilters}
                >
                  <option value="">-</option>
                  {filterOptions.categories.map((category) => (
                    <option value={category.id} key={category.id}>
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
                  onChange={updateFilters}
                >
                  <option value="">-</option>
                  {filters.category &&
                    filterOptions.subCategories
                      .filter(
                        (subCat) =>
                          subCat.category.id.toString() === filters.category
                      )
                      .map((subCategory) => (
                        <option value={subCategory.id} key={subCategory.id}>
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
