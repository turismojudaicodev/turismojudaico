import Head from 'next/head'
import Layout from '@/components/Layout'

export default function Newsletter() {
  return (
    <>
      <Head>
        <title>title</title>
      </Head>
      <Layout>
        <main>
          <h1>Suscribite a nuestra newsletter</h1>
          <form>
            <div>
              <label htmlFor="name">Nombre</label>
              <input id="name" type="text"></input>
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" type="email"></input>
            </div>
            <button type="submit">Enviar</button>
          </form>
        </main>
      </Layout>
    </>
  )
}
