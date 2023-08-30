// NPM
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
// Local
import { getFilteredContent } from 'lib/api'
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
    },
  }
}

export default function Content() {
  const [data, setData] = useState({
    countries: [],
    cities: [],
    categories: [],
  })
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { t } = useTranslation(['posts', 'common'])

  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await getContent('/api/content/posts')
      setIsLoading(false)
      if (error) return setErrorMessage(error)
      setPosts(data)
    }
    setIsLoading(true)
    fetchData()
  }, [])

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)

    const formData = Object.fromEntries(new FormData(ev.target))

    try {
      const { data, error } = await getFilteredContent(
        '/api/content/posts',
        formData
      )
      if (error) return setErrorMessage(error)
      setPosts(data)
    } catch (error) {
      setErrorMessage(error.message)
    }
    setIsLoading(false)
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
            </div>
          </div>
          <div>
            <h2 className={utils.bigTitle}>
              {t('body.filter', { ns: 'posts' })}
            </h2>
            <form onSubmit={handleSubmit} className={utils.form}>
              <InputText
                label={t('body.form.title', { ns: 'posts' })}
                name="post"
                attrs={{ placeholder: t('body.form.placeholder') }}
              />
              <Select
                label={t('body.form.country', { ns: 'posts' })}
                name="country"
                options={data.countries}
              />
              <Select
                label={t('body.form.city', { ns: 'posts' })}
                name="city"
                options={data.cities}
              />
              <Select
                label={t('body.form.category', { ns: 'posts' })}
                name="category"
                options={data.categories}
              />

              <ButtonLoader
                isLoading={isLoading}
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
