import Head from 'next/head'
import Link from 'next/link'
import Header from '@/components/Header'
import styles from '@/styles/About.module.css'
import utils from '@/styles/utils.module.css'

export default function About(props) {
  return (
    <>
      <Head>
        <title>title</title>
      </Head>
      <Header />
      <main className={`${utils.centeredContainer} ${styles.main}`}>
        <h1>Turismo Judaico</h1>
        <h2>¿Qué es www.turismojudaico.com?</h2>
        <p>
          TURISMO JUDAICO es un proyecto social, llevado adelante por miembros de las comunidades judías locales, con la misión de mostrar la vida judía en ciudades de Latinoamérica y el resto del mundo.
        </p>
        <div>
          <h3>Objetivos:</h3>
          <ul>
            <li>
              Fortalecer la identidad judía a través de la preservación y la valoración de nuestro patrimonio.
            </li>
            <li>
              Transformar lugares judíos en sitios turísticos interesantes y accesibles.
            </li>
            <li>
              Conectar a los viajeros con la historia, la cultura y la vida judía de todo el mundo.
            </li>
          </ul>
        </div>
        <div>
          <h3>¿Cómo lo hacemos?</h3>
          <p>
            Ofrecemos información sobre sitios judaicos en todos los rincones de América Latina, incluidos museos, monumentos, sitios históricos, sinagogas y restaurantes kosher.
          </p>
          <p>
            Brindamos paseos históricos de valor patrimonial visitando sitios judíos, ofrecemos experiencias locales y culturales, consejos de viaje por anfitriones locales, organización y asesoría de viajes grupales y todo tipo de servicios turísticos para viajeros judíos, principalmente en Latinoamérica.
          </p>
          <p>
            Trabajamos conjuntamente con miembros de las comunidades judías locales en diferentes ciudades, ofreciendo tours y experiencias judías en todo el mundo, funcionando como una gran red. Creamos cada itinerario y cada propuesta de acuerdo al interés de los participantes.
          </p>
          <p>
            El sello distintivo de este proyecto es que todos los guías de nuestros Jewish Tours son miembros locales activos de cada comunidad judía, que cuentan sus propias historias de vida judía y participan como anfitriones culturales con los visitantes. Otro aspecto destacado del proyecto, es que todos los lugares visitados son sitios e instituciones con las cuales Turismo Judaico trabaja conjuntamente para abrir sus puertas y dar a conocer sus historias. 
          </p>
        </div>
        <div>
          <h3>¿Por qué elegirnos?</h3>
          <p>
            TURISMO JUDAICO es un proyecto donde &quot;todos ganan&quot;, tanto desde la misión social, como desde las ganancias, ya que una parte de nuestros ingresos se destinan como colaboración a proyectos comunitarios y donaciones a los sitios judíos visitados.
          </p>
          <p>
            Invitamos a los viajeros judíos de todo el mundo a pasar al menos un día, o incluso unas pocas horas, de sus vacaciones o viajes de negocios, conectándose con sus raíces, visitando diferentes lugares representativos de la vida judía local, aprendiendo sobre la inmigración judía y conociendo acerca de la comunidad judía local, en cualquier ciudad donde se encuentren de viaje.
          </p>
          <p>
            Estamos muy contentos de conectar a los viajeros judíos con las comunidades judías locales, descubriendo cómo los participantes y las comunidades se potencian y fortalecen.
          </p>
        </div>
        <div>
          <h3>Servicios</h3>
          <p>
            Nuestro sitio web funciona como una &quot;guía de viaje&quot; que presenta información turística sobre lugares judíos en diferentes ciudades de Latinoamérica, incluida información de museos, monumentos, sitios históricos, sinagogas, tiendas y restaurantes kosher, entre otras cosas.
          </p>
          <p>
            También se ofrecen recorridos judíos y viajes temáticos en diferentes ciudades del mundo, trabajando directamente con las comunidades judías locales a través de guías especializados y equipos locales.
          </p>
          <p>
            Ofrecemos una variedad de servicios a viajeros judíos:
          </p>
          <ul>
            <li>City Tours Judaicos y viajes temáticos con contenido cultural y patrimonial</li>
            <li>Información sobre comidas kosher y reservas en restaurantes kosher</li>
            <li>Cenas de Shabat</li>
            <li>Traslados en taxis con conductores que hablan español, inglés y/o hebreo</li>
            <li>Orientación e información de contacto para visitar las sinagogas</li>
          </ul>
          <p>
            y todo lo que un viajero judío pueda necesitar.
          </p>
          <Link className={utils.button} href="/contact">Contacto</Link>
        </div>
      </main>
    </>
  )
}