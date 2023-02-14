// NPM
import { useEffect, useState } from 'react'
// Local
import { fetchStrapi } from 'lib/api'
// import { db } from 'lib/db'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import CardsContainer from '@/components/CardsContainer'
// Styles
import styles from '@/styles/Content.module.css'
import utils from '@/styles/utils.module.css'
import Link from 'next/link'
import Message from '@/components/Message'

// function SearchedPosts({ posts }) {}

export default function Content() {
  const [countries, setCountries] = useState([])
  const [currentCountry, setCurrentCountry] = useState(null)
  const [categories, setCategories] = useState([])
  const [currentCategory, setCurrentCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessages, setErrorMessages] = useState([])
  const [posts, setPosts] = useState(null)

  useEffect(() => {
    async function fetchInitalPosts() {
      try {
        const postsData = await fetchStrapi(
          'posts',
          '?pagination[page]=1&pagination[pageSize]=8'
        )
        setPosts(postsData)
      } catch (error) {
        setErrorMessages((prevValue) => prevValue.concat(error.message))
      }
    }
    async function fetchFormContentData() {
      try {
        const countriesData = await fetchStrapi(
          'countries',
          '?populate[cities][fields][0]=name'
        )
        setCountries(countriesData)
        const categoriesData = await fetchStrapi(
          'categories',
          '?populate[subCategories][fields][0]=name'
        )
        setCategories(categoriesData)
      } catch (error) {
        setErrorMessages((prevValue) => prevValue.concat(error.message))
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

    const result = await fetchStrapi(
      'posts',
      queryParams === '?' ? '' : queryParams
    )

    setPosts(result)
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
        <title>Contenido</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <div>
            <h1 className={utils.bigTitle}>Últimos posteos</h1>
            <div className={styles.searchedContentContainer}>
              {!posts || isLoading ? (
                <LoadingIndicator />
              ) : errorMessages.length > 0 ? (
                <div>
                  {errorMessages.map((errorMsg) => (
                    <Message type="error" message={errorMsg} />
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <CardsContainer cardsName="posts" cards={posts} />
              ) : (
                <Message type="info" message="Aún no hay contenido publicado" />
              )}
            </div>
          </div>
          <div>
            <h2 className={utils.bigTitle}>Filtrar</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <label htmlFor="post">Título</label>
                <input
                  type="text"
                  name="post"
                  className={utils.input}
                  placeholder="Buscar..."
                ></input>
              </div>
              <div>
                <label htmlFor="country">País</label>
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
                <label htmlFor="city">Ciudad</label>
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
                <label htmlFor="category">Categoría</label>
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
                <label htmlFor="subCategory">Sub categoría</label>
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
                Buscar
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
