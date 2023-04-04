// NPM
import { useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'
// Local
import { setTimedMessage } from 'helpers'
import emailIcon from 'public/icons/email.svg'
// Components
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/Layout'
// Styles
import styles from '@/styles/Contact.module.css'
import utils from '@/styles/utils.module.css'
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['contact'])),
    },
  }
}

export default function Contact() {
  const [isLoading, setIsLoading] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { t } = useTranslation('contact')

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    const formData = Object.fromEntries(new FormData(ev.target))
    console.log('formdata', formData)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      setTimedMessage(data.success, setInfoMessage, 3000)
    } catch (error) {
      setTimedMessage(error.message, setErrorMessage, 3000)
    }
    setIsLoading(false)
  }

  return (
    <>
      <Head>
        <title>{t('head.title')}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <h1 className={utils.bigTitle}>{t('body.title')}</h1>
          <h2>{t('body.subTitle')}</h2>
          <div className={styles.contentContainer}>
            <div>
              <h2>{t('body.sections.consultation.title')}</h2>
              {isLoading ? (
                <LoadingIndicator />
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="name" className={utils.inputRequired}>
                      {t('body.sections.consultation.name')}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className={utils.input}
                    ></input>
                  </div>
                  <div>
                    <label htmlFor="email" className={utils.inputRequired}>
                      {t('body.sections.consultation.email')}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className={utils.input}
                    ></input>
                  </div>
                  <div>
                    <label htmlFor="tel">
                      {t('body.sections.consultation.telephone')}
                    </label>
                    <input
                      id="tel"
                      name="tel"
                      type="tel"
                      className={utils.input}
                    ></input>
                  </div>
                  <div>
                    <label htmlFor="message" className={utils.inputRequired}>
                      {t('body.sections.consultation.message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      className={utils.input}
                    ></textarea>
                  </div>
                  {infoMessage ? (
                    <Message type="info" message={infoMessage} />
                  ) : errorMessage ? (
                    <Message type="error" message={errorMessage} />
                  ) : null}
                  <button className={utils.button} type="submit">
                    {t('body.sections.consultation.submit')}
                  </button>
                </form>
              )}
            </div>
            <div>
              <h2>{t('body.sections.details.title')}</h2>
              <div>
                <ul className={styles.contactDetailsList}>
                  <li>
                    <Link
                      className={`${styles.emailLink} ${utils.underlinedButton}`}
                      href={'mailto:info@turismojudaico.com'}
                    >
                      <Image
                        src={emailIcon}
                        width={25}
                        height={25}
                        alt="email icon"
                      />
                      info@turismojudaico.com
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  )
}
