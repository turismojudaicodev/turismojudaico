// NPM
import { useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
// Local
import { handleNewsletterSignup } from 'lib/api'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
// Styles
import styles from '@/styles/Newsletter.module.css'
import utils from '@/styles/utils.module.css'
import Message from '@/components/Message'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['newsletter'])),
    },
  }
}

export default function Newsletter() {
  const [errorMessage, setErrorMessage] = useState('')

  const { t } = useTranslation('newsletter')

  const router = useRouter()

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    try {
      setErrorMessage('')
      const formData = Object.fromEntries(new FormData(ev.target))
      const { success, error } = await handleNewsletterSignup(formData)
      if (error) throw new Error(error)
      console.log(success)
    } catch (error) {
      setErrorMessage(error.message)
    }
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
            <p>Y enterate de las novedades y toures próximos.</p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <label htmlFor="name" className={utils.inputRequired}>
                  {t('body.form.name')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={utils.input}
                ></input>
              </div>
              <div>
                <label htmlFor="lastName">{t('body.form.lastName')}</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  className={utils.input}
                ></input>
              </div>
              <div>
                <label htmlFor="email" className={utils.inputRequired}>
                  {t('body.form.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={utils.input}
                  defaultValue={router.query?.email || ''}
                ></input>
              </div>
              {errorMessage ? (
                <Message type="error" message={errorMessage} />
              ) : null}
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
