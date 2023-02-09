// NPM
import { useEffect, useState } from 'react'
// Local
import Head from 'next/head'
// import { db } from 'lib/db'
import { fetchStrapi } from 'lib/api'
// Components
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/Layout'
// Styles
import styles from '@/styles/Blogs.module.css'
import utils from '@/styles/utils.module.css'

export default function Blogs() {
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    fetchStrapi('blogs').then((data) => {
      setBlogs(data)
      console.log(data)
    })
  }, [])

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
                      src={
                        blog.attributes.img
                          ? `${blog.attributes.img}`
                          : '/images/logo.png'
                      }
                      fill
                      alt="img"
                    />
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
          </div>
        </main>
      </Layout>
    </>
  )
}

// export async function getStaticProps() {
//   let blogs = []

//   try {
//     const [rows, fields] = await db.query('SELECT * FROM `blogs`')
//     blogs = rows
//   } catch (error) {
//     console.error(error)
//     throw new Error('Error while fetching blogs')
//   } finally {
//     return {
//       props: {
//         blogs: JSON.parse(JSON.stringify(blogs)),
//       },
//     }
//   }
// }
