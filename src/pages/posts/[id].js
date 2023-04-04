// NPM
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
// Local
import { fetchStrapi } from 'lib/api'
import { formatDate } from 'helpers'
import { handleError } from 'lib/errors'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'
// Styles
import utils from '@/styles/utils.module.css'

export default function Post() {
  const router = useRouter()
  const { id } = router.query

  const [post, setPost] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!id) return
    async function fetchPost() {
      setIsLoading(true)
      try {
        const { data, error } = await fetchStrapi(`posts/${id}`)
        if (error) handleError(error)
        const htmlContent = await formatMarkDown(data.attributes.content)
        data.attributes.content = htmlContent
        setPost(data)
      } catch (error) {
        setErrorMessage(error.message)
      }
      setIsLoading(false)
    }
    fetchPost()
  }, [id])

  return (
    <>
      <Head>
        <title>{post?.attributes?.title || 'Error al cargar el post'}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${utils.marginBlock}`}>
          {errorMessage ? (
            <Message type="error" message={errorMessage} />
          ) : (!post && !isLoading) || isLoading ? (
            <LoadingIndicator />
          ) : (
            <>
              <h2 className={utils.bigTitle}>{post.attributes.title}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: post.attributes.content }}
                className={utils.htmlContent}
              ></div>
              <p>Publicado el {formatDate(post.attributes.createdAt)}</p>
            </>
          )}
        </main>
      </Layout>
    </>
  )
}
