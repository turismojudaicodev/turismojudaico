// NPM
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
// Local
import { getUniqueContent } from 'lib/api'
import { formatDate, setImageSrc } from 'helpers'
// Components
import Head from 'next/head'
import Image from 'next/image'
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'
// Styles
import styles from '@/styles/Blogs.module.css'
import utils from '@/styles/utils.module.css'

export default function Blog() {
  const [blog, setBlog] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await getUniqueContent(
        '/api/content/blogs',
        router.query.id
      )
      setIsLoading(false)
      if (error) return setErrorMessage(error)
      setBlog(data)
    }
    if (blog?.nombre && blog?.nombre_en) {
      const encodedBlogTitle =
        router.locale === 'es' ? fixUrl(blog?.nombre) : fixUrl(blog?.nombre_en)
      const newUrl = `/blog/${blog?.codigo}/${encodedBlogTitle}`
      window.history.pushState({ path: newUrl }, '', newUrl)
    }
    setIsLoading(true)
    if (router.isReady) fetchData()
  }, [router.isReady])

  return (
    <>
      <Head>
        <title>{router.locale === 'es' ? blog?.nombre : blog?.nombre_en}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          {isLoading ? (
            <LoadingIndicator />
          ) : errorMessage.length > 0 ? (
            <Message type="error" message={errorMessage} />
          ) : (
            <div className={styles.blogInfo}>
              <h1 className={utils.bigTitle} style={{ textAlign: 'center' }}>
                {router.locale === 'es' ? blog.nombre : blog.nombre_en}
              </h1>
              <div
                style={{
                  aspectRatio: '16/9',
                  position: 'relative',
                  border: '1px solid lightgray',
                }}
              >
                <img
                  src={
                    router.locale === 'es'
                      ? setImageSrc(blog.imagen, 'noticias')
                      : setImageSrc(blog.imagen_en, 'noticias')
                  }
                  style={{
                    objectFit: 'cover',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  alt="Blog main image"
                />
              </div>
              <div className={styles.content}>
                {router.locale === 'es'
                  ? blog?.texto && (
                      <div dangerouslySetInnerHTML={{ __html: blog.texto }} />
                    )
                  : blog?.texto_en?.split('\n\r').map((text, i) => (
                      <div style={{ marginBlock: '1.5em' }} key={i}>
                        {text.split('\n').map((text, i) => (
                          <p
                            key={i}
                            dangerouslySetInnerHTML={{ __html: text }}
                          />
                        ))}
                      </div>
                    ))}
              </div>
              <p>
                {router.locale === 'es'
                  ? `Publicado el ${formatDate(blog.fechacreacion)}`
                  : `Published at ${formatDate(blog.fechacreacion, 'en-US')}`}
              </p>
            </div>
          )}
        </main>
      </Layout>
    </>
  )
}
