// NPM
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
// Components
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
// Styles
import styles from '@/styles/About.module.css'
import utils from '@/styles/utils.module.css'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'about'])),
    },
  }
}

export default function About() {
  const { t } = useTranslation('about')

  return (
    <>
      <Head>
        <title>{t('head.title')}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <h1>{t('body.title')}</h1>
          <h2>{t('body.subTitle')}</h2>
          <p>{t('body.description')}</p>
          <div>
            <h3>{t('body.sections.objectives.title')}</h3>
            <ul>
              <li>{t('body.sections.objectives.ul.li1')}</li>
              <li>{t('body.sections.objectives.ul.li2')}</li>
              <li>{t('body.sections.objectives.ul.li3')}</li>
            </ul>
          </div>
          <div>
            <h3>{t('body.sections.how.title')}</h3>
            <p>{t('body.sections.how.p1')}</p>
            <p>{t('body.sections.how.p2')}</p>
            <p>{t('body.sections.how.p3')}</p>
            <p>{t('body.sections.how.p4')}</p>
          </div>
          <div>
            <h3>{t('body.sections.why.title')}</h3>
            <p>{t('body.sections.why.p1')}</p>
            <p>{t('body.sections.why.p2')}</p>
            <p>{t('body.sections.why.p3')}</p>
          </div>
          <div>
            <h3>{t('body.sections.services.title')}</h3>
            <p>{t('body.sections.services.p1')}</p>
            <p>{t('body.sections.services.p2')}</p>
            <p>{t('body.sections.services.p3')}</p>
            <ul>
              <li>{t('body.sections.services.ul.li1')}</li>
              <li>{t('body.sections.services.ul.li2')}</li>
              <li>{t('body.sections.services.ul.li3')}</li>
              <li>{t('body.sections.services.ul.li4')}</li>
              <li>{t('body.sections.services.ul.li5')}</li>
            </ul>
            <p>{t('body.sections.services.p4')}</p>
            <Link className={utils.button} href="/contact">
              Contacto
            </Link>
          </div>
        </main>
      </Layout>
    </>
  )
}
