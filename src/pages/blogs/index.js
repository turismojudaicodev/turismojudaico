import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/Layout'
import styles from '@/styles/Blogs.module.css'
import utils from '@/styles/utils.module.css'
import { API_URL } from 'lib/api'

export async function getStaticProps() {
  const res = await fetch(`${API_URL}/blogs`)
  const blogs = await res.json()

  return {
    props: {
      blogs: blogs.data,
    },
  }
}

export default function Blogs({ blogs }) {
  if (!blogs) return <Layout>Cargando contenido...</Layout>

  return (
    <>
      <Head>
        <title>Blogs</title>
      </Head>
      <Layout>
        <main>
          {blogs &&
            blogs.map((blog) => (
              <div key={blog.id} className={styles.blog}>
                <div className={styles.imgContainer}>
                  <Image src="/images/logo.png" fill alt="img" />
                </div>
                <div className={styles.info}>
                  <div>
                    <h3>{blog.attributes.title}</h3>
                    <p>{blog.attributes.description}</p>
                  </div>
                  <Link href={`/blogs/${blog.id}`} className={utils.button}>
                    Seguir leyendo
                  </Link>
                </div>
              </div>
            ))}
        </main>
      </Layout>
    </>
  )
}
