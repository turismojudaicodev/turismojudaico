import Head from 'next/head'
import Layout from '@/components/Layout'
import styles from '@/styles/Newsletter.module.css'
import utils from '@/styles/utils.module.css'

export default function Newsletter() {
  return (
    <>
      <Head>
        <title>title</title>
      </Head>
      <Layout>
        <main className={styles.main}>
          <h1>Suscribite a nuestra newsletter</h1>
          <form className={styles.form}>
            <div>
              <label htmlFor="name">Nombre</label>
              <input id="name" type="text" className={utils.input}></input>
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" className={utils.input}></input>
            </div>
            <button type="submit" className={utils.button}>
              Enviar
            </button>
          </form>
        </main>
      </Layout>
    </>
  )
}
