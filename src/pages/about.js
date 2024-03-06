// NPM
import { useEffect, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
// Local
import { getContent } from 'lib/api'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
// Styles
import styles from '@/styles/About.module.css'
import utils from '@/styles/utils.module.css'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'about'])),
      locale,
    },
  }
}

export default function About({ locale }) {
  const { t } = useTranslation(['common', 'about'])

  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await getContent('/api/content/about?estado=1')
      setIsLoading(false)
      setContent(data[0])
      if (error) return setErrorMessage(error)
    }
    setIsLoading(true)
    fetchData()
  }, [])

  return (
    <>
      <Head>
        <title>{t('head.title', { ns: 'about' })}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          {isLoading ? (
            <p>Cargando...</p>
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html:
                  locale === 'es' ? content?.contenido : content?.contenido_en,
              }}
            ></div>
          )}
        </main>
      </Layout>
    </>
  )
}
