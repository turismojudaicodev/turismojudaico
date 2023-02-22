// NPM
import { useEffect, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
// Local
// import { db } from 'lib/db'
import { fetchStrapi } from 'lib/api'
import { handleError } from 'lib/errors'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import CardsContainer from '@/components/CardsContainer'
// Styles
import styles from '@/styles/Blogs.module.css'
import utils from '@/styles/utils.module.css'
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'blogs'])),
    },
  }
}

export default function Blogs() {
  const [blogs, setBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { locale } = useRouter()
  const { t } = useTranslation(['common', 'blogs'])

  useEffect(() => {
    async function fetchBlogs() {
      setIsLoading(true)
      try {
        const { data, error } = await fetchStrapi(
          'blogs',
          `?locale=${locale}&populate=image`
        )
        if (error) handleError(error)
        setBlogs(data)
      } catch (error) {
        setErrorMessage(error.message)
      }
      setIsLoading(false)
    }
    fetchBlogs()
  }, [locale])

  return (
    <>
      <Head>
        <title>{t('head.title', { ns: 'blogs' })}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <h1 className={`${styles.blogsPageTitle} ${utils.bigTitle}`}>
            {t('body.title', { ns: 'blogs' })}
          </h1>
          {errorMessage ? (
            <Message type="error" message={errorMessage} />
          ) : (blogs.length === 0 && isLoading) || isLoading ? (
            <LoadingIndicator />
          ) : blogs.length > 0 ? (
            <CardsContainer
              cardsName="blogs"
              cards={blogs}
              linkText={t('cardsContainerText', { ns: 'common' })}
            />
          ) : (
            <Message
              type="info"
              message={t('body.noContent', { ns: 'blogs' })}
            />
          )}
        </main>
      </Layout>
    </>
  )
}

// export async function getStaticProps() {
//   let blogs = []

//   try {
//     const [rows, fields] = await db.query('SELECT * FROM `blogs`')
//     blogs = rows
//   } catch (error) {
//     console.error(error)
//     throw new Error('Error while fetching blogs')
//   } finally {
//     return {
//       props: {
//         blogs: JSON.parse(JSON.stringify(blogs)),
//       },
//     }
//   }
// }
