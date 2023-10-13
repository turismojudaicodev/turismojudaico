// NPM
import { useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'
// Local
import emailIcon from 'public/icons/email.svg'
import { postContent } from 'lib/api'
// Components
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/Layout'
import Message from '@/components/Message'
import Notification from '@/components/Notification'
import ButtonLoader from '@/components/ButtonLoader'
// Styles
import styles from '@/styles/Contact.module.css'
import utils from '@/styles/utils.module.css'

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
    const formData = Object.fromEntries(new FormData(ev.target))

    try {
      const { message, error } = await postContent('/api/contact', formData)
      if (error) return setErrorMessage(error)
      setInfoMessage(message)
    } catch (error) {
      setErrorMessage(error.message)
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
                {errorMessage && (
                  <Message type="error" message={errorMessage} />
                )}
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
          {infoMessage && (
            <Notification
              notification={infoMessage}
              setNotification={setInfoMessage}
            />
          )}
        </main>
      </Layout>
    </>
  )
}
