import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Head from 'next/head'

export default function Newsletter() {
  return (
    <>
      <Head>
        <title>title</title>
      </Head>
      <Header />
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
      <Footer />
    </>
  )
}