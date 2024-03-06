// NPM
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
// Local
import { getContent } from 'lib/api'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'
import ButtonLoader from '@/components/ButtonLoader'
import { PostCard } from '@/components/PostCard'
import { InputText, Select } from '@/components/DashboardComponents'
// Styles
import styles from '@/styles/Posts.module.css'
import utils from '@/styles/utils.module.css'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'posts'])),
      locale,
    },
  }
}

const LIMIT = 5

export default function Content({ locale }) {
  const [data, setData] = useState({
    countries: [],
    cities: [],
    categories: [],
  })
  const [posts, setPosts] = useState([])
  const [offset, setOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isFiltersLoading, setIsFiltersLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)

  const { t } = useTranslation(['posts', 'common'])

  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data: postsData, error: postsError } = await getContent(
        `/api/content/posts?limit=${LIMIT}&offset=0&estado=1`
      )
      setIsLoading(false)
      if (postsError) return setErrorMessage(postsError)
      setPosts(postsData)
      // const { data: postsCount, error: postsCountError } = await getContent(
      //   '/api/content/posts/count?estado=1'
      // )
      const { data: countriesData, error: countriesError } = await getContent(
        '/api/content/countries?reduced=1&active=1'
      )
      const { data: citiesData, error: citiesError } = await getContent(
        '/api/content/cities?reduced=1&active=1'
      )
      const { data: categoriesData, error: categoriesError } = await getContent(
        '/api/content/categories?reduced=1&active=1'
      )
      setIsFiltersLoading(false)
      if (countriesError || citiesError || categoriesError) {
        return setErrorMessage(
          `${countriesError ?? ''} ${citiesError ?? ''} ${
            categoriesError ?? ''
          }`
        )
      }
      setOffset((v) => (v += 5))
      setData({
        countries: countriesData,
        cities: citiesData,
        categories: categoriesData,
      })
    }
    setIsLoading(true)
    setIsFiltersLoading(true)
    fetchData()
  }, [])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))
    try {
      const params = Object.entries(formData).filter(([key, value]) => {
        return value !== '' && value !== '0'
      })
      const stringParams = new URLSearchParams(params).toString()

      const { data, error } = await getContent(
        `/api/content/posts?estado=1&${stringParams}`
      )
      if (error) return setErrorMessage(error)
      setPosts(data)
    } catch (error) {
      setErrorMessage(error.message)
    }
    setIsLoading(false)
  }

  const handleLoadMore = async (ev) => {
    const formData = Object.fromEntries(
      new FormData(document.getElementById('filter-form'))
    )
    console.log({ formData })
    const params = Object.entries(formData).filter(([key, value]) => {
      return value !== '' && value !== '0'
    })
    const stringParams = new URLSearchParams(params).toString()

    setIsLoading(true)
    const { data, error } = await getContent(
      `/api/content/posts?estado=1&limit=5&offset=${offset}`
    )
    setIsLoading(false)
    if (error) return setErrorMessage(error)
    setOffset((v) => (v += 5))
    setPosts(data)
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
              ) : (posts.length === 0 && isLoading) || isLoading ? (
                <LoadingIndicator />
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    post={post}
                    key={post.codigo}
                    locale={router.locale}
                  />
                ))
              ) : (
                <Message type="info" message={t('body.alerts.noContent')} />
              )}
              {!isLoading && posts.length > LIMIT && (
                <ButtonLoader
                  isLoading={isLoading}
                  attrs={{ onClick: handleLoadMore }}
                >
                  {router.locale === 'es' ? 'Cargar otros' : 'Load more'}
                </ButtonLoader>
              )}
            </div>
          </div>
          <div className={styles.formContainer}>
            <h2 className={utils.bigTitle}>
              {t('body.filter', { ns: 'posts' })}
            </h2>
            <form
              onSubmit={handleSubmit}
              className={utils.form}
              id="filter-form"
            >
              <InputText
                label={t('body.form.title', { ns: 'posts' })}
                name="nombre"
                attrs={{ placeholder: t('body.form.placeholder') }}
              />
              <Select
                label={t('body.form.country', { ns: 'posts' })}
                name="pais"
                options={data.countries}
                attrs={{
                  onChange: (ev) => setSelectedCountry(ev.target.value),
                }}
              />
              <Select
                label={t('body.form.city', { ns: 'posts' })}
                name="ciudad"
                options={data?.cities?.filter(
                  (city) => city.pais == selectedCountry
                )}
              />
              <Select
                label={t('body.form.category', { ns: 'posts' })}
                name="categoria"
                options={data.categories}
                locale={locale}
              />

              <ButtonLoader
                isLoading={isLoading || isFiltersLoading}
                className={utils.button}
                type="submit"
              >
                {t('body.form.submit', { ns: 'posts' })}
              </ButtonLoader>
            </form>
          </div>
        </main>
      </Layout>
    </>
  )
}
