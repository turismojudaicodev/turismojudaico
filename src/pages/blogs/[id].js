import { remark } from 'remark'
import html from 'remark-html'
import { formatDate } from 'helpers'
import Image from 'next/image'
import Layout from '@/components/Layout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
// export async function getStaticPaths() {
//   const res = await fetch('http://localhost:1337/api/blogs')
//   const blogs = await res.json()

//   const paths = blogs.data.map((blog) => ({
//     params: { id: blog.id.toString() },
//   }))
//   return {
//     paths,
//     fallback: false,
//   }
// }

// export async function getStaticProps({ params: { id } }) {
//   const res = await fetch('http://localhost:1337/api/blogs/' + id)
//   const blogData = await res.json()

//   if (!blogData)
//     return {
//       props: {
//         blog: {},
//       },
//     }

//   const processedContent = await remark().use(html).process(blogAttrs.content)
//   const contentHtml = processedContent.toString()

//   const blog = {
//     ...blogAttrs,
//     content: contentHtml,
//   }

//   return {
//     props: {
//       blog,
//     },
//   }
// }

export default function Blog() {
  const [blog, setBlog] = useState(null)
  const router = useRouter()
  const blogId = router.query.id
  console.log(router)

  useEffect(() => {
    async function getBlog() {
      const res = await fetch(`http://localhost:1337/api/blogs/${blogId}`)
      const blogData = await res.json()
      console.log(blogData)
      const blog = blogData.attributes
      setBlog(blog)
    }
    getBlog()
  }, [blogId])

  if (!blog) return <Layout>Cargando blog...</Layout>
  console.log(blog)
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
