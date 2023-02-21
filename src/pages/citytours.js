// NPM
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation, UseTranslation } from 'next-i18next'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import Message from '@/components/Message'
// Styles
import styles from '@/styles/Citytours.module.css'
import utils from '@/styles/utils.module.css'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['citytours'])),
    },
  }
}

export default function Citytours() {
  const { t } = useTranslation('citytours')

  return (
    <>
      <Head>
        <title>{t('head.title')}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <Message type="info" message={t('body.alert.noContent')} />
        </main>
      </Layout>
    </>
  )
}
