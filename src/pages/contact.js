// NPM
import { useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'
// Local
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
import ButtonLoader from '@/components/ButtonLoader'
import { handleError } from 'lib/errors'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['contact'])),
    },
  }
}

const contactMessageInitState = {
  name: '',
  email: '',
  tel: '',
  message: '',
}

export default function Contact() {
  const [contactMessage, setContactMessage] = useState(contactMessageInitState)
  const [isLoading, setIsLoading] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const { t } = useTranslation('contact')

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(contactMessage),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const { error, success } = await res.json()
      if (error) throw new Error(error)
      setInfoMessage(success)
      setTimeout(() => {
        setInfoMessage('')
      }, 3000)
    } catch (error) {
      setErrorMessage(error.message)
      setTimeout(() => {
        setErrorMessage('')
      }, 3000)
    }
    setContactMessage(contactMessageInitState)
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
              <form className={styles.form} onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className={utils.inputRequired}>
                    {t('body.sections.consultation.name')}
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={contactMessage.name}
                    onChange={(ev) => {
                      setContactMessage((prev) => ({
                        ...prev,
                        name: ev.target.value,
                      }))
                    }}
                    required
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
                    value={contactMessage.email}
                    onChange={(ev) => {
                      setContactMessage((prev) => ({
                        ...prev,
                        email: ev.target.value,
                      }))
                    }}
                    required
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
                    value={contactMessage.tel}
                    onChange={(ev) => {
                      setContactMessage((prev) => ({
                        ...prev,
                        tel: ev.target.value,
                      }))
                    }}
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
                    value={contactMessage.message}
                    onChange={(ev) => {
                      setContactMessage((prev) => ({
                        ...prev,
                        message: ev.target.value,
                      }))
                    }}
                    required
                    className={utils.input}
                  ></textarea>
                </div>
                {infoMessage ? (
                  <Message type="info" message={infoMessage} />
                ) : errorMessage ? (
                  <Message type="error" message={errorMessage} />
                ) : null}
                <ButtonLoader
                  attributes={{ type: 'submit' }}
                  isLoading={isLoading}
                  loadingMessage={t('body.sections.consultation.loading')}
                >
                  {t('body.sections.consultation.submit')}
                </ButtonLoader>
              </form>
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
