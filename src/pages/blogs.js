import Head from 'next/head'
import Image from 'next/image'
import Layout from '@/components/Layout'

export async function getServerSideProps() {
  const res = await import('../../db.json')
  const data = JSON.parse(JSON.stringify(res))
  const { blogs } = data
  return {
    props: {
      blogs,
    },
  }
}

export default function Blogs({ blogs }) {
  return (
    <>
      <Head>
        <title>Blogs</title>
      </Head>
      <Layout>
        <main>
          {blogs.map((blog) => (
            <div key={blog.id}>
              <Image src={blog.img} height={50} width={200} alt="img" />
              <div>
                <h3>{blog.title}</h3>
                <p>{blog.content}</p>
              </div>
            </div>
          ))}
        </main>
      </Layout>
    </>
  )
}
