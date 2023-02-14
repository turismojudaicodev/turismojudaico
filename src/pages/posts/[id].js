// NPM
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
// Local
import { fetchStrapi } from 'lib/api'
import { formatDate, formatMarkDown } from 'helpers'
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
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!id) return
    async function fetchPost() {
      try {
        const data = await fetchStrapi(`posts/${id}`)
        const htmlContent = await formatMarkDown(data.attributes.content)
        data.attributes.content = htmlContent
        setPost(data)
      } catch (error) {
        setErrorMessage(error.message)
      }
    }
    fetchPost()
  }, [id])

  if (!post)
    return (
      <Layout>
        <div className={utils.centeredMainContent}>
          <LoadingIndicator />
        </div>
      </Layout>
    )

  if (errorMessage)
    return (
      <Layout>
        <Message type="error" message={errorMessage} />
      </Layout>
    )

  return (
    <>
      <Head>
        <title>{post.attributes.title}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${utils.marginBlock}`}>
          <h2 className={utils.bigTitle}>{post.attributes.title}</h2>
          <div
            dangerouslySetInnerHTML={{ __html: post.attributes.content }}
            className={utils.htmlContent}
          ></div>
          <p>Publicado el {formatDate(post.attributes.createdAt)}</p>
        </main>
      </Layout>
    </>
  )
}
