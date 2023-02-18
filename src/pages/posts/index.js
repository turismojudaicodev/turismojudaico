// NPM
import { useEffect, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation, UseTranslation } from 'next-i18next'
// Local
import { fetchStrapi } from 'lib/api'
import { handleError } from 'lib/errors'
// import { db } from 'lib/db'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import CardsContainer from '@/components/CardsContainer'
import Message from '@/components/Message'
// Styles
import styles from '@/styles/Content.module.css'
import utils from '@/styles/utils.module.css'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'posts'])),
    },
  }
}

export default function Content() {
  const [countries, setCountries] = useState([])
  const [currentCountry, setCurrentCountry] = useState(null)
  const [categories, setCategories] = useState([])
  const [currentCategory, setCurrentCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [posts, setPosts] = useState([])

  const { t } = useTranslation(['posts', 'common'])

  useEffect(() => {
    async function fetchInitalPosts() {
      setIsLoading(true)
      try {
        const { data: postsData, error: postsError } = await fetchStrapi(
          'posts',
          '?pagination[page]=1&pagination[pageSize]=8'
        )
        if (postsError) handleError(postsError)
        setPosts(postsData)
      } catch (error) {
        setErrorMessage(error.message)
      }
      setIsLoading(false)
    }
    async function fetchFormContentData() {
      try {
        const { data: countriesData, error: countriesError } =
          await fetchStrapi('countries', '?populate[cities][fields][0]=name')
        if (countriesError) handleError(countriesError)
        setCountries(countriesData)
        const { data: categoriesData, error: categoriesError } =
          await fetchStrapi(
            'categories',
            '?populate[subCategories][fields][0]=name'
          )
        if (categoriesError) handleError(categoriesError)
        setCategories(categoriesData)
      } catch (error) {
        setErrorMessage(error.message)
      }
    }
    fetchInitalPosts()
    fetchFormContentData()
  }, [])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))

    let queryParams = '?'
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
        if (index !== 0) queryParams += '&'
        queryParams += `${filter[0]}[${index}]=${filter[1]}`
      })
    }

    try {
      const { data, error } = await fetchStrapi(
        'posts',
        queryParams === '?' ? '' : queryParams
      )
      if (error) handleError(error)
      setPosts(data)
    } catch (error) {
      setErrorMessage(error.message)
    }
    setIsLoading(false)
  }

  const updateCountry = (ev) => {
    const countryName = ev.target.value
    const selectedCountry = countries.find(
      (country) => country.attributes.name === countryName
    )
    // console.log('selectedCountry', selectedCountry)
    setCurrentCountry(selectedCountry)
  }

  const updateCategory = (ev) => {
    const categoryName = ev.target.value
    const selectedCategory = categories.find(
      (category) => category.attributes.name === categoryName
    )
    // console.log('selectedCategory', selectedCategory)
    setCurrentCategory(selectedCategory)
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
              ) : (posts.length === 0 && !isLoading) || isLoading ? (
                <LoadingIndicator />
              ) : posts.length > 0 ? (
                <CardsContainer
                  cardsName="posts"
                  cards={posts}
                  linkText={t('cardsContainerText', { ns: 'common' })}
                />
              ) : (
                <Message type="info" message="Aún no hay contenido publicado" />
              )}
            </div>
          </div>
          <div>
            <h2 className={utils.bigTitle}>
              {t('body.filter', { ns: 'posts' })}
            </h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <label htmlFor="post">
                  {t('body.form.title', { ns: 'posts' })}
                </label>
                <input
                  type="text"
                  name="post"
                  className={utils.input}
                  placeholder="Buscar..."
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
                  {countries.map((country) => (
                    <option value={country.attributes.name} key={country.id}>
                      {country.attributes.name}
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
                  {currentCountry &&
                    currentCountry.attributes.cities.data.map((city) => (
                      <option value={city.attributes.name} key={city.id}>
                        {city.attributes.name}
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
                  {categories.map((category) => (
                    <option value={category.attributes.name} key={category.id}>
                      {category.attributes.name}
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
                    currentCategory.attributes.subCategories.data.map(
                      (subCategory) => (
                        <option
                          value={subCategory.attributes.name}
                          key={subCategory.id}
                        >
                          {subCategory.attributes.name}
                        </option>
                      )
                    )}
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

// export async function getStaticProps() {
//   const postsQuery =
//     'SELECT `p`.*, c.name AS `category`, sc.name AS `sub_ategory` FROM posts p, posts_category_links pcl, posts_sub_category_links pscl, categories c, sub_categories sc WHERE pcl.post_id = p.id AND pscl.post_id = p.id AND pcl.category_id = c.id AND pscl.sub_category_id = sc.id;'

//   const [posts, postsFields] = await db.query(postsQuery)

//   const categoriesQuery = `
//     SELECT c.name AS "category", sc.name AS "sub_category"
//     FROM categories c, sub_categories sc, sub_categories_category_links sccl
//     WHERE sccl.category_id = c.id AND sccl.sub_category_id = sc.id;
//   `

//   const [categories, categoriesFields] = await db.query(categoriesQuery)

//   return {
//     props: {
//       posts: JSON.parse(JSON.stringify(posts)),
//       categories: JSON.parse(JSON.stringify(categories)),
//     },
//   }
// }
