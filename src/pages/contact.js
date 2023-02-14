import Head from 'next/head'
import Layout from '@/components/Layout'
import styles from '@/styles/Contact.module.css'
import utils from '@/styles/utils.module.css'
import Link from 'next/link'
import Image from 'next/image'
import emailIcon from 'public/icons/email.svg'

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
        <main className={`${utils.container} ${styles.main}`}>
          <h1 className={utils.bigTitle}>Turismo Judaico</h1>
          <h2>Contáctenos</h2>
          <div className={styles.contentContainer}>
            <div>
              <h2>Escriba aquí su consulta</h2>
              <form className={styles.form} onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name">Nombre</label>
                  <input id="name" type="text" className={utils.input}></input>
                </div>
                <div>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className={utils.input}
                  ></input>
                </div>
                <div>
                  <label htmlFor="tel">Teléfono</label>
                  <input id="tel" type="tel" className={utils.input}></input>
                </div>
                <div>
                  <label htmlFor="message">Mensaje</label>
                  <textarea id="message" className={utils.input}></textarea>
                </div>
                <button className={utils.button} type="submit">
                  Enviar
                </button>
              </form>
            </div>
            <div>
              <h2>Datos de contacto</h2>
              <div>
                <ul className={styles.contactDetailsList}>
                  <li>
                    <Link
                      className={`${styles.emailLink} ${utils.underlinedButton}`}
                      href={'mailto:info@turismojudaico.com'}
                    >
                      <Image
                        src={emailIcon}
                        width={25}
                        height={25}
                        alt="email icon"
                      />
                      info@turismojudaico.com
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  )
}
