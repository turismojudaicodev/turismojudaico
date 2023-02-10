// NPM
import { useRouter } from 'next/router'
// Local
import { fetchStrapi } from 'lib/api'
import { formatMarkDown } from 'helpers'
// Components
import Head from 'next/head'
import Layout from '@/components/Layout'
import { useEffect, useState } from 'react'
// Styles
import utils from '@/styles/utils.module.css'

export default function Post() {
  const router = useRouter()
  const { id } = router.query

  const [post, setPost] = useState(null)

  useEffect(() => {
    if (!id) return
    async function fetchPost() {
      const data = await fetchStrapi(`posts/${id}`)
      const htmlContent = await formatMarkDown(data.attributes.content)
      data.attributes.content = htmlContent
      setPost(data)
    }
    fetchPost()
  }, [id])

  if (!post) return <Layout>Cargando post...</Layout>

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
        </main>
      </Layout>
    </>
  )
}
