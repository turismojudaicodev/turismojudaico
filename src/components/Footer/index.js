import Image from 'next/image'
import Link from 'next/link'
import styles from './Footer.module.css'
import utils from '@/styles/utils.module.css'
import imgLogoSrc from '../../../public/images/logo.png'
import pinterestIcon from '../../../public/icons/pinterest-logo.svg'
import facebookIcon from '../../../public/icons/facebook-logo.svg'
import youtubeIcon from '../../../public/icons/youtube-logo.svg'

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/TurismoJudaico',
    icon: facebookIcon
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/user/TurismoJudaico',
    icon: youtubeIcon
  },
  {
    name: 'Pinterest',
    url: 'https://www.pinterest.com/TurismoJudaico/',
    icon: pinterestIcon
  },
]

export default function Footer() {
  const handleEmailSubmit = (ev) => {
    ev.preventDefault()
  }

  return (
    <footer className={styles.footer}>
      <div className={utils.container}>       
        <div className={styles.colsContainer}>
          <div className={styles.newsletter}>
            <h3>Newsletter</h3>
            <form onSubmit={handleEmailSubmit} className={styles.newsletter}>
              <input type="email" placeholder="Su email" className={utils.input}></input>
              <button type="submit" className={utils.button}>Suscribirse</button>
            </form>
          </div>
          <div>
            <h3>Contacto</h3>
            <Link href="mailto:info@turismojudaico.com" className={utils.linkButton}>
              info@turismojudaico.com
            </Link>
          </div>
          <div>
            <h3>Nuestras Redes</h3>
            <div className={styles.socialLinks}>
              {SOCIAL_LINKS.map((link) => 
                <Link 
                  key={link.url} 
                  href={link.url} 
                  target="_blank"
                  className={utils.linkButton}
                >
                  {/* <Image
                    src={link.icon}
                    width={25} 
                    height={25} 
                    alt={`${link.name} icon`} 
                  /> */}
                  {link.name}
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2023 - Turismo Judaico, todos los derechos reservados.</p>
          <Link href="/legal" className={utils.underlinedButton}>
            Aviso legal
          </Link>
        </div>
      </div>
    </footer>
  )
}

function AlternativeFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.info}>
        <div className={styles.logoContainer}>
          <Image  
            src={imgLogoSrc} 
            width={75}
            height={75}
            alt="Our logo" 
          />
        </div>
        <p>© 2023 Turismo Judaico, todos los derechos reservados</p>
        <Link href="mailto:info@turismojudaico.com">
          info@turismojudaico.com
        </Link>
        <Link href="/legal" className={utils.underlinedButton}>
          Aviso legal
        </Link>
      </div>
      <div>
        <h3>Nuestras Redes</h3>
        <div className={styles.socialLinks}>
          {SOCIAL_LINKS.map((link) => 
            <Link key={link.url} href={link.url} target="_blank">
              <Image
                src={link.icon}
                width={25} 
                height={25} 
                alt={`${link.name} icon`} 
              />
            </Link>
          )}
        </div>
      </div>
    </footer>
  )
}
