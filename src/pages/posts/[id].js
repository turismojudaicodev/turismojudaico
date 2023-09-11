// NPM
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
// Local
import { formatDate } from 'helpers'
import { getUniqueContent } from 'lib/api'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'
// Styles
import utils from '@/styles/utils.module.css'

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
              <h2 className={utils.bigTitle}>
                {router.locale === 'es' ? post.nombre : post.nombre_en}
              </h2>
              <p>{router.locale === 'es' ? post.texto : post.text_en}</p>
            </>
          )}
        </main>
      </Layout>
    </>
  )
}
