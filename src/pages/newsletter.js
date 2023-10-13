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
import Notification from '@/components/Notification'
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
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const { t } = useTranslation('newsletter')

  const router = useRouter()

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setErrorMessage('')
    const formData = Object.fromEntries(new FormData(ev.target))
    const { message, error } = await handleNewsletterSignup(formData)
    if (error) return setErrorMessage(error)
    setInfoMessage(message)
    document.getElementById('newsletter-form').reset()
  }

  return (
    <>
      <Head>
        <title>{t('head.title')}</title>
      </Head>
      <Layout>
        <main className={styles.main}>
          {errorMessage && (
            <Notification
              type="error"
              notification={errorMessage}
              setNotification={setErrorMessage}
            />
          )}
          {infoMessage && (
            <Notification
              notification={infoMessage}
              setNotification={setInfoMessage}
            />
          )}
          <div className={utils.container}>
            <h1>{t('body.title')}</h1>
            <p>{t('body.p1')}</p>
            <form
              onSubmit={handleSubmit}
              className={styles.form}
              id="newsletter-form"
            >
              <div>
                <label htmlFor="name" className={utils.inputRequired}>
                  {t('body.form.name')}
                </label>
                <input
                  id="name"
                  name="nombre"
                  type="text"
                  className={utils.input}
                ></input>
              </div>
              <div>
                <label htmlFor="lastName">{t('body.form.lastName')}</label>
                <input
                  id="lastName"
                  name="apellido"
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
                  name="mail"
                  type="email"
                  className={utils.input}
                  defaultValue={router.query?.email || ''}
                ></input>
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
