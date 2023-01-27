import Head from 'next/head'
import Layout from '@/components/Layout'
import styles from '@/styles/Contact.module.css'
import utils from '@/styles/utils.module.css'

export default function Contact() {
  const handleSubmit = (ev) => {
    ev.preventDefault()
  }

  return (
    <>
      <Head>
        <title>title</title>
      </Head>
      <Layout>
        <main>
          <h1>Turismo Judaico</h1>
          <div>
            <h2>Escriba aquí su consulta</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name">Nombre</label>
                <input id="name" type="text" className={utils.input}></input>
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" className={utils.input}></input>
              </div>
              <div>
                <label htmlFor="tel">Teléfono</label>
                <input id="tel" type="tel" className={utils.input}></input>
              </div>
              <div>
                <label htmlFor="message">Mensaje</label>
                <textarea id="message" className={utils.input}></textarea>
              </div>
              <button className={utils.button} type="submit">Enviar</button>
            </form>
          </div>
          <div>
            <h2>Datos de contacto</h2>
            <div>...</div>
          </div>
        </main>
      </Layout>
    </>
  )
}