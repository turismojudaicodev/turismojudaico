// NPM
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { formatDate } from 'helpers'
// Local
// import { db } from 'lib/db'
import { fetchStrapi } from 'lib/api'
import { formatMarkDown } from 'helpers'
// Components
import Image from 'next/image'
import Layout from '@/components/Layout'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Blogs.module.css'

export default function Blog() {
  const router = useRouter()
  const { id } = router.query

  const [blog, setBlog] = useState(null)

  useEffect(() => {
    if (!id) return
    async function fetchBlog() {
      const data = await fetchStrapi(`blogs/${id}`)
      const htmlContent = await formatMarkDown(data.attributes.content)
      data.attributes.content = htmlContent
      setBlog(data)
    }
    fetchBlog()
  }, [id])

  if (!blog) return <Layout>Cargando blog...</Layout>

  return (
    <Layout>
      <main className={`${utils.container} ${styles.main}`}>
        <div>
          <h2>{blog.attributes.title}</h2>
          <p>{blog.attributes.description}</p>
          <Image
            src={blog.attributes.img || '/images/logo.png'}
            height={250}
            width={300}
            alt="Blog main image"
          />
          <div
            dangerouslySetInnerHTML={{ __html: blog.attributes.content }}
            className={styles.contentContainer}
          />
          <p>Publicado el {formatDate(blog.attributes.published_at)}</p>
        </div>
      </main>
    </Layout>
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
