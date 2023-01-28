import { getBlogs } from 'lib/blogs'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/Layout'
import utils from '@/styles/utils.module.css'

export async function getStaticProps() {
  const blogs = await getBlogs()
  return {
    props: {
      blogs: blogs.data,
    },
  }
}

export default function Blogs({ blogs }) {
  console.log('blogs', blogs)

  return (
    <>
      <Head>
        <title>Blogs</title>
      </Head>
      <Layout>
        <main>
          {blogs.map((blog) => (
            <div key={blog.id}>
              <Image src="/images/logo.png" height={50} width={200} alt="img" />
              <div>
                <h3>{blog.attributes.title}</h3>
                <p>{blog.attributes.description}</p>
              </div>
              <Link href={`/blogs/${blog.id}`} className={utils.button}>
                Seguir leyendo
              </Link>
            </div>
          ))}
        </main>
      </Layout>
    </>
  )
}
