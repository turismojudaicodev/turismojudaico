// NPM
import { useState, useEffect } from 'react'
import { useRouter, withRouter } from 'next/router'
// Local
import instagramIcon from '../../../public/icons/instagram-icon.png'
import facebookIcon from '../../../public/icons/facebook-logo.svg'
import youtubeIcon from '../../../public/icons/youtube-logo.svg'
// Components
import Link from 'next/link'
import Image from 'next/image'
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
    name: 'Instagram',
    url: 'https://www.instagram.com/turismojudaico',
    icon: instagramIcon,
  },
]

function Footer(props) {
  const [i18n, setI18n] = useState({})
  const { locale } = useRouter()

  useEffect(() => {
    async function fetchLocale() {
      const translation = await import(`public/locales/${locale}/footer.json`)
      setI18n(translation)
    }
    fetchLocale()
  }, [locale])

  const handleEmailSubmit = async (ev) => {
    ev.preventDefault()
    const formData = Object.fromEntries(new FormData(ev.target))
    console.log('formData', formData)
    props.router.push({
      pathname: `/newsletter`,
      query: { email: formData.email },
    })
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
                name="email"
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
                  <Image
                    src={link.icon}
                    alt={`${link.name} logo`}
                    width={15}
                    height={15}
                  />
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

export default withRouter(Footer)
