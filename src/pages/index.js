// NPM
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
// Local
import { getContent } from 'lib/api'
import { setImageSrc } from 'helpers'
// Components
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'
import Image from 'next/image'
import { Carousel } from 'react-responsive-carousel'
import { TourCardFeatured } from '@/components/TourCardFeatured'
// Styles
import styles from '@/styles/Home.module.css'
import utils from '@/styles/utils.module.css'
import 'react-responsive-carousel/lib/styles/carousel.min.css' // Carousel requires a loader

const SUPPORTERS = [
  {
    image: '/images/supporters/logonatan.jpg',
  },
  {
    image: '/images/supporters/logoroi.png',
  },
  {
    image: '/images/supporters/schusterman.png',
  },
  {
    image: '/images/supporters/clam.gif',
  },
  {
    image: '/images/supporters/limmud.png',
  },
  {
    image: '/images/supporters/lazos.png',
  },
  {
    image: '/images/supporters/kahal.png',
  },
  {
    image: '/images/supporters/bbyo.png',
  },
  {
    image: '/images/supporters/entwine.png',
  },
  {
    image: '/images/supporters/jdc.png',
  },
  {
    image: '/images/supporters/cuja.png',
  },
]

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['index', 'common'])),
      locale,
    },
  }
}

export default function Home({ locale }) {
  // tours, staticImages,
  const [toursSmall, setToursSmall] = useState([])
  const [toursBig, setToursBig] = useState([])
  const [logos, setLogos] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { t } = useTranslation(['index', 'common'])

  useEffect(() => {
    async function fetchData() {
      const { data: toursChico, error: toursChicoError } = await getContent(
        '/api/content/tours?destacadohomechico=1'
      )
      const { data: toursGrande, error: toursGrandeError } = await getContent(
        '/api/content/tours?destacadohomegrande=1'
      )
      const { data: logos, error: logosError } = await getContent(
        '/api/content/logos?estado=1'
      )
      setIsLoading(false)
      if (toursChicoError || toursGrandeError || logosError)
        return setErrorMessage(
          `${toursChicoError ?? ''} ${toursGrandeError ?? ''} ${
            logosError ?? ''
          }`
        )
      setToursSmall(toursChico)
      setToursBig(toursGrande)
      setLogos(logos)
    }
    setIsLoading(true)
    fetchData()
  }, [])

  return (
    <>
      <Head>
        <title>{t('head.title', { ns: 'index' })}</title>
        {locale === 'es' ? (
          <meta
            name="description"
            content="Empresa social y educativa que promueve la herencia judía en América Latina y busca conectar a los viajeros con las comunidades locales, compartiendo la vibrante vida judía, la rica historia y cultura, tanto en la región como en todo el mundo."
          />
        ) : (
          <meta
            name="description"
            content="Social and educational company that promotes Jewish heritage in Latin America, and seeks to connect travelers with local communities, sharing vibrant Jewish life, rich history and culture, both in the region and around the world."
          />
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="google-site-verification"
          content="smSJnz75XCcBhv06hcAJqzLuzls0xqdREFaQLpf28VI"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <main className={`${styles.main} ${utils.container}`}>
          <h1 className={utils.bigTitle}>{t('body.title', { ns: 'index' })}</h1>
          <div className={styles.carouselContainer}>
            <Carousel
              autoPlay
              infiniteLoop
              showStatus={false}
              showThumbs={false}
              dynamicHeight
              width="100%"
            >
              {toursBig.length > 0 ? (
                toursBig.map((tour) => (
                  <Link
                    href={`/tours/${tour.codigo}`}
                    key={tour.codigo}
                    target="_blank"
                  >
                    <div style={{ aspectRatio: '5/3', position: 'relative' }}>
                      <Image
                        alt={tour.imagen1}
                        src={setImageSrc(tour.imagen1, 'citytours')}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ aspectRatio: '5/3', position: 'relative' }}>
                  <Image
                    alt="Slider image"
                    src="/images/logo.png"
                    fill
                    style={{ objectFit: 'contain', padding: '15%' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
            </Carousel>
          </div>
          <div className={styles.postsContainer}>
            <h2 className={utils.mediumTitle}>{t('body.featuredTours')}</h2>
            {isLoading ? (
              <LoadingIndicator />
            ) : toursSmall.length > 0 ? (
              <div className={styles.featuredToursContainer}>
                {toursSmall.map((tour) => (
                  <TourCardFeatured
                    key={tour.codigo}
                    tour={tour}
                    locale={locale}
                  />
                ))}
              </div>
            ) : (
              <Message
                type="info"
                message={
                  locale === 'es'
                    ? 'No hay tours disponibles'
                    : "There isn't any tour available now"
                }
              />
            )}
          </div>
          <h2>
            {locale === 'es'
              ? 'NOS ACOMPAÑAN Y CONFÍAN EN NOSOTROS'
              : 'THEY ACCOMPANY US AND TRUST US:'}
          </h2>
          <div className={styles.supporters}>
            {isLoading ? (
              <LoadingIndicator />
            ) : logos.length > 0 ? (
              logos.map((logo, index) => (
                <Image
                  key={index}
                  src={logo.imagen}
                  alt={logo.nombre}
                  width={75}
                  height={75}
                  style={{ objectFit: 'contain' }}
                />
              ))
            ) : (
              SUPPORTERS.map((supporter, index) => (
                <Image
                  key={index}
                  src={supporter.image}
                  alt={supporter.image}
                  width={75}
                  height={75}
                />
              ))
            )}
          </div>
        </main>
      </Layout>
    </>
  )
}
