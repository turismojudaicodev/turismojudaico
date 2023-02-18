// NPM
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
// Local
import pinterestIcon from '../../../public/icons/pinterest-logo.svg'
import facebookIcon from '../../../public/icons/facebook-logo.svg'
import youtubeIcon from '../../../public/icons/youtube-logo.svg'
// Components
import Image from 'next/image'
import Link from 'next/link'
// Styles
import styles from './Footer.module.css'
import utils from '@/styles/utils.module.css'

const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/TurismoJudaico',
    icon: facebookIcon,
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/user/TurismoJudaico',
    icon: youtubeIcon,
  },
  {
    name: 'Pinterest',
    url: 'https://www.pinterest.com/TurismoJudaico/',
    icon: pinterestIcon,
  },
]

export default function Footer() {
  const [i18n, setI18n] = useState({})
  const { locale } = useRouter()

  useEffect(() => {
    async function fetchLocale() {
      const translation = await import(`public/locales/${locale}/footer.json`)
      setI18n(translation)
    }
    fetchLocale()
  }, [locale])

  console.log('render')

  const handleEmailSubmit = (ev) => {
    ev.preventDefault()
  }

  return (
    <footer className={styles.footer}>
      <div className={utils.container}>
        <div className={styles.colsContainer}>
          <div className={styles.newsletter}>
            <h3>{i18n?.newsletter?.title}</h3>
            <form onSubmit={handleEmailSubmit} className={styles.newsletter}>
              <input
                type="email"
                placeholder={`${i18n?.newsletter?.placeholder}`}
                className={utils.input}
              ></input>
              <button type="submit" className={utils.button}>
                {i18n?.newsletter?.suscribe}
              </button>
            </form>
          </div>
          <div>
            <h3>{i18n?.contact?.title || 'a'}</h3>
            <Link
              href="mailto:info@turismojudaico.com"
              className={utils.linkButton}
            >
              info@turismojudaico.com
            </Link>
          </div>
          <div>
            <h3>{i18n?.socialMedia?.title || ' a'}</h3>
            <div className={styles.socialLinks}>
              {SOCIAL_LINKS.map((link) => (
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
              ))}
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>{i18n?.bottom?.rights}</p>
          <Link href="/legal" className={utils.underlinedButton}>
            {i18n?.bottom?.legal}
          </Link>
        </div>
      </div>
    </footer>
  )
}
