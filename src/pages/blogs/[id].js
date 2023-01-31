import { remark } from 'remark'
import html from 'remark-html'
import { formatDate } from 'helpers'
import Image from 'next/image'
import Layout from '@/components/Layout'
import { promisePool } from 'lib/db'

export async function getStaticPaths() {
  const [rows, fields] = await promisePool.query('SELECT * FROM `blogs`')
  // console.log('blogs', rows)
  const paths = rows.map((blog) => ({
    params: { id: blog.id.toString() },
  }))

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params: { id } }) {
  const [rows, fields] = await promisePool.query(
    'SELECT * FROM `blogs` WHERE id = ?',
    [id]
  )
  const [blog] = rows
  // console.log('this is the blog', blog)
  const processedContent = await remark().use(html).process(blog.content)
  const contentHtml = processedContent.toString()

  const blogWithContent = {
    ...blog,
    content: contentHtml,
  }

  return {
    props: {
      blog: JSON.parse(JSON.stringify(blogWithContent))
    },
  }
}

export default function Blog({ blog }) {
  if (!blog) return <Layout>Cargando blog...</Layout>
  
  return (
    <Layout>
      <main>
        {blog ? (
          <div>
            <h1>{blog.title}</h1>
            <p>{blog.description}</p>
            <Image
              src={blog.img || '/images/logo.png'}
              height={250}
              width={300}
              alt="Blog main image"
            />
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            <p>Publicado el {formatDate(blog.publishedAt)}</p>
          </div>
        ) : (
          <div>Cargando blog...</div>
        )}
      </main>
    </Layout>
  )
}
