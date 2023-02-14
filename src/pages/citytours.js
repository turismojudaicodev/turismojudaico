import Head from 'next/head'
import Layout from '@/components/Layout'
import Message from '@/components/Message'
import styles from '@/styles/Citytours.module.css'
import utils from '@/styles/utils.module.css'

export default function Citytours() {
  return (
    <>
      <Head>
        <title>title</title>
      </Head>
      <Layout>
        <main className={`${utils.container} ${styles.main}`}>
          <Message type="info" message="Aún no hay City tours disponibles" />
        </main>
      </Layout>
    </>
  )
}
