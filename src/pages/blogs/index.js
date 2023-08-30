// NPM
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
// Local
import { getContent } from 'lib/api'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import { BlogCard } from '@/components/BlogCard'
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'
// Styles
import styles from '@/styles/Blogs.module.css'
import utils from '@/styles/utils.module.css'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'blogs'])),
    },
  }
}

export default function Blogs() {
  const { t } = useTranslation(['common', 'blogs'])

  const [blogs, setBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await getContent('/api/content/blogs')
      setIsLoading(false)
      if (error) return setErrorMessage(error)
      setBlogs(data)
    }
    setIsLoading(true)
    fetchData()
  }, [])

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
          {isLoading && <LoadingIndicator />}
          {blogs.length > 0 ? (
            <div>
              {blogs.map((blog) => (
                <BlogCard blog={blog} key={blog.codigo} />
              ))}
            </div>
          ) : errorMessage.length > 0 ? (
            <Message type="error" message={errorMessage} />
          ) : (
            <Message
              type="info"
              message={t('body.alerts.noContent', { ns: 'blogs' })}
            />
          )}
        </main>
      </Layout>
    </>
  )
}
