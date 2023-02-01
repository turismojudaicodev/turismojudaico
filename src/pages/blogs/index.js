import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/Layout'
import styles from '@/styles/Blogs.module.css'
import utils from '@/styles/utils.module.css'
import { promisePool } from 'lib/db'

export async function getStaticProps() {
  const [rows, fields] = await promisePool.query('SELECT * FROM `blogs`')

  return {
    props: {
      blogs: JSON.parse(JSON.stringify(rows)),
    },
  }
}

export default function Blogs({ blogs }) {
  // console.log('these are the blogs', blogs)

  if (!blogs) return <Layout>Cargando contenido...</Layout>

  return (
    <>
      <Head>
        <title>Blogs</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <div className={styles.blogsContainer}>
            {blogs &&
              blogs.map((blog) => (
                <div key={blog.id} className={styles.blog}>
                  <div className={styles.imgContainer}>
                    <Image
                      src={blog.img ? `${blog.img}` : '/images/logo.png'}
                      fill
                      alt="img"
                    />
                  </div>
                  <div className={styles.info}>
                    <div>
                      <h3>{blog.title}</h3>
                      <p>{blog.description}</p>
                    </div>
                    <Link href={`/blogs/${blog.id}`} className={utils.button}>
                      Seguir leyendo
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </main>
      </Layout>
    </>
  )
}
