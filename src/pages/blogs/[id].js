// NPM
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
// Local
// import { db } from 'lib/db'
import { fetchStrapi } from 'lib/api'
import { formatMarkDown, formatDate } from 'helpers'
// Components
import Head from 'next/head'
import Image from 'next/image'
import Layout from '@/components/Layout'
import Message from '@/components/Message'
import LoadingIndicator from '@/components/LoadingIndicator'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Blogs.module.css'

export default function Blog() {
  const router = useRouter()
  const { id } = router.query

  const [blog, setBlog] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!id) return
    async function fetchBlog() {
      try {
        const data = await fetchStrapi(`blogs/${id}`)
        const htmlContent = await formatMarkDown(data.attributes.content)
        data.attributes.content = htmlContent
        setBlog(data)
      } catch (error) {
        setErrorMessage(error?.message)
      }
    }
    fetchBlog()
  }, [id])

  if (!blog)
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
        <title>{blog.attributes.title}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <div className={styles.blogInfo}>
            <h2 className={utils.bigTitle}>{blog.attributes.title}</h2>
            <p>{blog.attributes.description}</p>
            <Image
              src={blog.attributes.img || '/images/logo.png'}
              height={250}
              width={300}
              alt="Blog main image"
            />
            <div
              dangerouslySetInnerHTML={{ __html: blog.attributes.content }}
              className={utils.htmlContent}
            />
            <p>Publicado el {formatDate(blog.attributes.publishedAt)}</p>
          </div>
        </main>
      </Layout>
    </>
  )
}

// export async function getStaticPaths() {
//   const [rows, fields] = await db.query('SELECT * FROM `blogs`')
//   // console.log('blogs', rows)
//   const paths = rows.map((blog) => ({
//     params: { id: blog.id.toString() },
//   }))

//   return {
//     paths,
//     fallback: false,
//   }
// }

// export async function getStaticProps({ params: { id } }) {
//   const [rows, fields] = await db.query('SELECT * FROM `blogs` WHERE id = ?', [
//     id,
//   ])
//   const [blog] = rows
//   // console.log('this is the blog', blog)
//   const processedContent = await remark().use(html).process(blog.content)
//   const contentHtml = processedContent.toString()

//   const blogWithContent = {
//     ...blog,
//     content: contentHtml,
//   }

//   return {
//     props: {
//       blog: JSON.parse(JSON.stringify(blogWithContent)),
//     },
//   }
// }
