import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Head from 'next/head'
import utils from '@/styles/utils.module.css'

export default function Contact() {
  const handleSubmit = (ev) => {
    ev.preventDefault()
  }

  return (
    <>
      <Head></Head>
      <Header />
      <main>
        <h1>Turismo Judaico</h1>
        <div>
          <h2>Escriba aquí su consulta</h2>
          <form className={utils.form} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name">Nombre</label>
              <input id="name" type="text"></input>
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" type="email"></input>
            </div>
            <div>
              <label htmlFor="tel">Teléfono</label>
              <input id="tel" type="tel"></input>
            </div>
            <div>
              <label htmlFor="message">Mensaje</label>
              <textarea id="message"></textarea>
            </div>
            <button className={utils.button} type="submit">Enviar</button>
          </form>
        </div>
        <div>
          <h2>Datos de contacto</h2>
          <div>...</div>
        </div>
      </main>
      <Footer />
    </>
  )
}