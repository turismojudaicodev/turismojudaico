// Local
import { prisma } from 'lib/prisma'
import { formatDate } from 'helpers'
// Components
import Head from 'next/head'
import Image from 'next/image'
import Layout from '@/components/Layout'
import LoadingIndicator from '@/components/LoadingIndicator'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Blogs.module.css'

export async function getStaticPaths() {
  const blogs = await prisma.blog.findMany()
  const paths = blogs.map((blog) => ({
    params: { id: blog.id.toString() },
  }))

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params: { id } }) {
  const blog = await prisma.blog.findUnique({ where: { id: Number(id) } })

  return {
    props: {
      blog: JSON.parse(JSON.stringify(blog)),
    },
  }
}

export default function Blog({ blog }) {
  return (
    <>
      <Head>
        <title>{blog.title || 'Error al cargar el blog'}</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          {!blog ? (
            <LoadingIndicator />
          ) : (
            <div className={styles.blogInfo}>
              <h2 className={utils.bigTitle}>{blog.title}</h2>
              <p>{blog.description}</p>
              <Image
                src={blog.img || '/images/logo.png'}
                height={250}
                width={300}
                alt="Blog main image"
              />
              <div
                dangerouslySetInnerHTML={{ __html: blog.content }}
                className={utils.htmlContent}
              />
              <p>Publicado el {formatDate(blog.createdAt)}</p>
            </div>
          )}
        </main>
      </Layout>
    </>
  )
}
