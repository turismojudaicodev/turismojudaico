// NPM
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation, UseTranslation } from 'next-i18next'
// Components
import Layout from '@/components/Layout'
import Message from '@/components/Message'
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
          <Message type="info" message={t('body.alert.noContent')} />
        </main>
      </Layout>
    </>
  )
}
