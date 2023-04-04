// NPM
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
// Local
import { prisma } from 'lib/prisma'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import CardsContainer from '@/components/CardsContainer'
// Styles
import styles from '@/styles/Blogs.module.css'
import utils from '@/styles/utils.module.css'
import Message from '@/components/Message'

export async function getStaticProps({ locale }) {
  const blogs = await prisma.blog.findMany()

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'blogs'])),
      blogs: JSON.parse(JSON.stringify(blogs)),
    },
  }
}

export default function Blogs({ blogs }) {
  const { t } = useTranslation(['common', 'blogs'])

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
          {blogs.length > 0 ? (
            <CardsContainer
              cardsName="blogs"
              cards={blogs}
              linkText={t('cardsContainerText', { ns: 'common' })}
            />
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
