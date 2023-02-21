// NPM
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation, UseTranslation } from 'next-i18next'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
// Styles
import styles from '@/styles/Newsletter.module.css'
import utils from '@/styles/utils.module.css'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['newsletter'])),
    },
  }
}

export default function Newsletter() {
  const { t } = useTranslation('newsletter')

  const handleSubmit = (ev) => {
    ev.preventDefault()
  }

  return (
    <>
      <Head>
        <title>{t('head.title')}</title>
      </Head>
      <Layout>
        <main className={styles.main}>
          <div className={utils.container}>
            <h1>{t('body.title')}</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <label htmlFor="name">{t('body.form.name')}</label>
                <input id="name" type="text" className={utils.input}></input>
              </div>
              <div>
                <label htmlFor="email">{t('body.form.email')}</label>
                <input id="email" type="email" className={utils.input}></input>
              </div>
              <button type="submit" className={utils.button}>
                {t('body.form.submit')}
              </button>
            </form>
          </div>
        </main>
      </Layout>
    </>
  )
}
