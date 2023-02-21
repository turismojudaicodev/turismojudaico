// NPM
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation, UseTranslation } from 'next-i18next'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Legal.module.css'

export async function getStaticProps({ locale }) {
  return {
    props: { ...(await serverSideTranslations(locale, ['legal'])) },
  }
}

export default function Legal() {
  const { t } = useTranslation('legal')

  return (
    <>
      <Head>
        <title>{t('head.title')}</title>
      </Head>
      <Layout>
        <main className={utils.container}>
          <div>
            <h1>{t('body.sections.s1.title')}</h1>
            <p>{t('body.sections.s1.p1')}</p>
            <p>{t('body.sections.s1.p2')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s2.title')}</h2>
            <p>{t('body.sections.s2.p1')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s3.title')}</h2>
            <p>{t('body.sections.s3.p1')}</p>
            <p>{t('body.sections.s3.p2')}</p>
            <p>{t('body.sections.s3.p3')}</p>
            <p>{t('body.sections.s3.p4')}</p>
            <p>{t('body.sections.s3.p5')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s4.title')}</h2>
            <p>{t('body.sections.s4.p1')}</p>
            <p>{t('body.sections.s4.p2')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s5.title')}</h2>
            <p>{t('body.sections.s5.p1')}</p>
            <p>{t('body.sections.s5.p2')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s6.title')}</h2>
            <p>{t('body.sections.s6.p1')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s7.title')}</h2>
            <p>{t('body.sections.s7.p1')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s8.title')}</h2>
            <p>{t('body.sections.s8.p1')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s9.title')}</h2>
            <p>{t('body.sections.s9.p1')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s10.title')}</h2>
            <p>{t('body.sections.s10.p1')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s11.title')}</h2>
            <p>{t('body.sections.s11.p1')}</p>
            <p>{t('body.sections.s11.p2')}</p>
            <p>{t('body.sections.s11.p3')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s12.title')}</h2>
            <p>{t('body.sections.s12.p1')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s13.title')}</h2>
            <p>{t('body.sections.s13.p1')}</p>
            <p>{t('body.sections.s13.p2')}</p>
            <p>{t('body.sections.s13.p3')}</p>
          </div>
          <div>
            <h2>{t('body.sections.s14.title')}</h2>
            <p>{t('body.sections.s14.p1')}</p>
            <p>{t('body.sections.s14.p2')}</p>
            <p>{t('body.sections.s14.p3')}</p>
            <p>{t('body.sections.s14.p4')}</p>
            <p>{t('body.sections.s14.p5')}</p>
          </div>
        </main>
      </Layout>
    </>
  )
}
