// NPM
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
// Components
import Layout from '@/components/Layout'
import Head from 'next/head'
// Styles
import styles from '@/styles/Audioguides.module.css'
import utils from '@/styles/utils.module.css'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['audioguides'])),
    },
  }
}

export default function Audioguides() {
  const { t } = useTranslation('audioguides')

  return (
    <>
      <Head>
        <title>{t('head.title')}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <h1 className={utils.bigTitle}>{t('body.title')}</h1>
          <iframe
            src="https://turismo-judaico.web.app?lng=es"
            style={{
              height: '500px',
              width: '100%',
              border: '2px solid #ccc',
              borderRadius: '.5rem',
              padding: '1rem',
            }}
            title="Audioguias"
          ></iframe>
        </main>
      </Layout>
    </>
  )
}
