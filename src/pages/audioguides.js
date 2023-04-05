// NPM
import { useEffect, useState } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
// Local
import { handleError } from 'lib/errors'
// Components
import Layout from '@/components/Layout'
import Message from '@/components/Message'
import Head from 'next/head'
import Link from 'next/link'
import LoadingIndicator from '@/components/LoadingIndicator'
// Styles
import styles from '@/styles/Audioguides.module.css'
import utils from '@/styles/utils.module.css'
import StrapiImage from '@/components/StrapiImage'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['audioguides'])),
    },
  }
}

export default function Audioguides() {
  const [audioguides, setAudioguides] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useTranslation('audioguides')

  return (
    <>
      <Head>
        <title>{t('head.title')}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <h1 className={utils.bigTitle}>{t('body.title')}</h1>
          {errorMessage ? (
            <Message type="error" message={errorMessage} />
          ) : (audioguides.length === 0 && isLoading) || isLoading ? (
            <LoadingIndicator />
          ) : audioguides.length > 0 ? (
            <div>
              {audioguides.map((audioguide) => {
                return (
                  <div key={audioguide.id} className={styles.audioguideCard}>
                    <div className={styles.imageContainer}>
                      <StrapiImage />
                    </div>
                    <div className={styles.audioguideData}>
                      <h2>{audioguide.attributes.title}</h2>
                      <p>{audioguide.attributes.description}</p>
                      <a
                        className={utils.button}
                        href="/images/logo.png"
                        download={audioguide.attributes.title}
                      >
                        Descargar
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <Message type="info" message={t('body.alerts.noContent')} />
          )}
        </main>
      </Layout>
    </>
  )
}
