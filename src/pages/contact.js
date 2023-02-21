// NPM
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

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['contact'])),
    },
  }
}

export default function Contact() {
  const { t } = useTranslation('contact')

  const handleSubmit = (ev) => {
    ev.preventDefault()
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
                  <label htmlFor="name">
                    {t('body.sections.consultation.name')}
                  </label>
                  <input id="name" type="text" className={utils.input}></input>
                </div>
                <div>
                  <label htmlFor="email">
                    {t('body.sections.consultation.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={utils.input}
                  ></input>
                </div>
                <div>
                  <label htmlFor="tel">
                    {t('body.sections.consultation.telephone')}
                  </label>
                  <input id="tel" type="tel" className={utils.input}></input>
                </div>
                <div>
                  <label htmlFor="message">
                    {t('body.sections.consultation.message')}
                  </label>
                  <textarea id="message" className={utils.input}></textarea>
                </div>
                <button className={utils.button} type="submit">
                  {t('body.sections.consultation.submit')}
                </button>
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
