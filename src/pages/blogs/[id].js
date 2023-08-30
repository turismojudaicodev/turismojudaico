// NPM
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
// Local
import { getUniqueContent } from 'lib/api'
import { formatDate } from 'helpers'
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
    setIsLoading(true)
    if (router.isReady) fetchData()
  }, [router.isReady])

  return (
    <>
      <Head>
        <title>{blog?.nombre || 'Blog'}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          {isLoading ? (
            <LoadingIndicator />
          ) : errorMessage.length > 0 ? (
            <Message type="error" message={errorMessage} />
          ) : (
            <div className={styles.blogInfo}>
              <h2 className={utils.bigTitle}>{blog.nombre}</h2>
              <p>{blog.description}</p>
              <Image
                src={blog.image || '/images/logo.png'}
                height={250}
                width={300}
                alt="Blog main image"
              />
              <div>
                {blog?.texto?.split('\n\r').map((text, i) => (
                  <div style={{ marginBlock: '1.5em' }} key={i}>
                    {text.split('\n').map((text, i) => (
                      <p key={i}>{text}</p>
                    ))}
                  </div>
                ))}
              </div>
              <p>Publicado el {formatDate(blog.fechacreacion)}</p>
            </div>
          )}
        </main>
      </Layout>
    </>
  )
}
