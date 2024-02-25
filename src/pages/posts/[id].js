// NPM
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
// Local
import { getUniqueContent } from 'lib/api'
import { setImageSrc } from 'helpers'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'
import Image from 'next/image'
import { Carousel } from 'react-responsive-carousel'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Posts.module.css'
import 'react-responsive-carousel/lib/styles/carousel.min.css' // Carousel requires a loader

function SliderImage({ imgSrc, alt }) {
  return (
    <div
      style={{
        aspectRatio: '5/3',
        position: 'relative',
        border: '1px solid lightgray',
      }}
    >
      <Image
        alt={alt || 'Sin Imagen'}
        src={imgSrc}
        fill
        style={{ objectFit: 'contain' }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}

export default function Post() {
  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await getUniqueContent(
        '/api/content/posts',
        router.query.id
      )
      setIsLoading(false)
      if (error) return setErrorMessage(error)
      setPost(data)
      console.log({ data })
    }
    setIsLoading(true)
    if (router.isReady) fetchData()
  }, [router.isReady])

  return (
    <>
      <Head>
        <title>{post?.nombre || 'Error al cargar el post'}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${utils.marginBlock}`}>
          {errorMessage ? (
            <Message type="error" message={errorMessage} />
          ) : (!post && !isLoading) || isLoading ? (
            <LoadingIndicator />
          ) : (
            <>
              <h2 className={utils.bigTitle} style={{ marginBottom: '1rem' }}>
                {router.locale === 'es' ? post.nombre : post.nombre_en}
              </h2>
              <div className={styles.moreInfoContainer}>
                {(post.direccion || post.localidad) && (
                  <div className={styles.moreInfoContainer__data}>
                    <img src="/icons/location.svg" alt="" />
                    <p>
                      {post.direccion}, {post.localidad}
                    </p>
                  </div>
                )}
                {post.telefono && (
                  <div className={styles.moreInfoContainer__data}>
                    <img src="/icons/telephone.svg" alt="" />
                    <p>{post.telefono}</p>
                  </div>
                )}
                {post.link && (
                  <div className={styles.moreInfoContainer__data}>
                    <img src="/icons/web.svg" alt="" />
                    <a href={post.link}>{post.link}</a>
                  </div>
                )}
                {post.mail && (
                  <div className={styles.moreInfoContainer__data}>
                    <img src="/icons/mail.svg" alt="" />
                    <a href={`mailto:${post.mail}`}>{post.mail}</a>
                  </div>
                )}
              </div>
              <div style={{ borderBottom: '4px solid var(--clr-green)' }}>
                <Carousel
                  autoPlay
                  infiniteLoop
                  showStatus={false}
                  showThumbs={false}
                  dynamicHeight
                  width="100%"
                >
                  {post.imagen1 && (
                    <SliderImage
                      imgSrc={setImageSrc(post?.imagen1, 'contenidos')}
                      alt={post.imagen1}
                    />
                  )}
                  {post.imagen2 && (
                    <SliderImage
                      imgSrc={setImageSrc(post?.imagen2, 'contenidos')}
                      alt={post.imagen2}
                    />
                  )}
                  {post.imagen3 && (
                    <SliderImage
                      imgSrc={setImageSrc(post?.imagen3, 'contenidos')}
                      alt={post.imagen3}
                    />
                  )}
                  {post.imagen4 && (
                    <SliderImage
                      imgSrc={setImageSrc(post?.imagen4, 'contenidos')}
                      alt={post.imagen4}
                    />
                  )}
                  {post.imagen5 && (
                    <SliderImage
                      imgSrc={setImageSrc(post?.imagen5, 'contenidos')}
                      alt={post.imagen5}
                    />
                  )}
                </Carousel>
              </div>
              {/* <div>
                <div>
                  <h3>Localidad</h3>
                  <p>{post.localidad || 'No especifado'}</p>
                </div>
                <div>
                  <h3>Dirección</h3>
                  <p>{post.direccion || 'No especificado'}</p>
                </div>
                <div>
                  <h3>Teléfono</h3>
                  <p>{post.telefono || 'No especificado'}</p>
                </div>
                <div>
                  <h3>Mail</h3>
                  <p>{post.mail || 'No especificado'}</p>
                </div>
                <div>
                  <h3>Link</h3>
                  <p>{post.link || 'No especificado'}</p>
                </div>
              </div> */}
              <div className={styles.content}>
                {router.locale === 'es'
                  ? post?.texto?.split('\n\r').map((text, i) => (
                      <div
                        style={{ marginBlock: '1.5em' }}
                        key={i}
                        className={styles.postTextContainer}
                      >
                        {text.split('\n').map((text, i) => (
                          <p
                            key={i}
                            dangerouslySetInnerHTML={{ __html: text }}
                          />
                        ))}
                      </div>
                    ))
                  : post?.texto_en?.split('\n\r').map((text, i) => (
                      <div
                        style={{ marginBlock: '1.5em' }}
                        key={i}
                        className={styles.postTextContainer}
                      >
                        {text.split('\n').map((text, i) => (
                          <p
                            key={i}
                            dangerouslySetInnerHTML={{ __html: text }}
                          />
                        ))}
                      </div>
                    ))}
              </div>
            </>
          )}
        </main>
      </Layout>
    </>
  )
}
