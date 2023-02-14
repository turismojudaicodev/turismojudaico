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
import LoadingIndicator from '@/components/LoadingIndicator'
import Message from '@/components/Message'

export default function Blogs() {
  const [blogs, setBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const blogsData = await fetchStrapi('blogs')
        setBlogs(blogsData)
      } catch (error) {
        setErrorMessage(error?.message)
      }
    }
    setIsLoading(true)
    fetchBlogs()
    setIsLoading(false)
  }, [])

  return (
    <>
      <Head>
        <title>Blogs</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <h1 className={`${styles.blogsPageTitle} ${utils.bigTitle}`}>
            Blogs
          </h1>
          {isLoading ? (
            <LoadingIndicator />
          ) : errorMessage ? (
            <Message type="error" message={errorMessage} />
          ) : blogs.length > 0 ? (
            <CardsContainer cardsName="blogs" cards={blogs} />
          ) : (
            <Message type="info" message="Aún no hay blogs publicados" />
          )}
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
