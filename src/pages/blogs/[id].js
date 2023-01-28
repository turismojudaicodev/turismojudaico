import { remark } from 'remark'
import html from 'remark-html'
import { formatDate } from 'helpers'
import { getBlog, getBlogs } from 'lib/blogs'
import Image from 'next/image'
import Layout from '@/components/Layout'

export async function getStaticPaths() {
  const { data } = await getBlogs()

  const paths = data.map((blog) => ({
    params: { id: blog.id.toString() },
  }))

  return {
    paths,
    fallback: true,
  }
}

export async function getStaticProps({ params: { id } }) {
  const data = await getBlog(id)

  const blogAttrs = data.data.attributes

  const processedContent = await remark().use(html).process(blogAttrs.content)
  const contentHtml = processedContent.toString()

  const blog = {
    ...blogAttrs,
    content: contentHtml,
  }

  return {
    props: {
      blog,
    },
  }
}

export default function Blog({ blog }) {
  return (
    <Layout>
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
      <main></main>
    </Layout>
  )
}
