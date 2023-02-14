import Layout from '@/components/Layout'
import Message from '@/components/Message'
import Head from 'next/head'
import styles from '@/styles/Audioguides.module.css'
import utils from '@/styles/utils.module.css'

export default function Audioguides() {
  return (
    <>
      <Head>
        <title>title</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <Message type="info" message="Aún no hay audioguías publicadas" />
        </main>
      </Layout>
    </>
  )
}
