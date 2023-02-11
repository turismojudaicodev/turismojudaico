// NPM
import { useEffect, useState } from 'react'
// Local
import Head from 'next/head'
// import { db } from 'lib/db'
import { fetchStrapi } from 'lib/api'
// Components
import Layout from '@/components/Layout'
import CardsContainer from '@/components/CardsContainer'
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
          <h1 className={utils.bigTitle}>Blogs</h1>
          {blogs && <CardsContainer cardsName="blogs" cards={blogs} />}
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
