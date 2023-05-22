// NPM
import { useRouter } from 'next/router'
import { useState } from 'react'
// Local
import useWidowSize from 'hooks/useWindowSize'
import imgLogoSrc from '../../../public/images/logo.png'
// Components
import Link from 'next/link'
import Image from 'next/image'
import NavMenu from '@/components/NavMenu'
// Styles
import styles from './Header.module.css'
import utils from '@/styles/utils.module.css'

const WINDOW_WIDTH_BREAKPOINT = 701

export default function Header() {
  const [navActive, setNavActive] = useState(false)
  const router = useRouter()
  const { width: windowWidth } = useWidowSize()

  const changeLang = (lang) => {
    router.push(router.pathname, router.pathname, {
      locale: lang,
    })
  }

  const toggleNav = () => {
    setNavActive((prevState) => !prevState)
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <div className={styles.logoImgContainer}>
              <Image src={imgLogoSrc} alt="Our logo" fill />
            </div>
          </Link>
          <p className={styles.logoContainerText}>
            <span style={{ fontSize: '1.5em', display: 'block'}}>City tours judaicos, </span>Experiencias de Cultura Local + Identidad
            Judaica Asesoramiento al viajero judío en Latinoamérica y el resto
            del mundo
          </p>
        </div>
        <div className={styles.controlers}>
          <button className={styles.flagButton} onClick={() => changeLang('es')}>
            <Image src="/icons/spain-flag.svg" alt='Idioma español' fill />
          </button>
          <button className={styles.flagButton} onClick={() => changeLang('en')}>
            <Image src="/icons/uk-flag.svg" alt='Idioma inglés' fill />
          </button>
          {windowWidth <= WINDOW_WIDTH_BREAKPOINT && (
            <div
              onClick={toggleNav}
              className={navActive ? styles.navButtonActive : styles.navButton}
            >
              <div></div>
              <div></div>
              <div></div>
            </div>
          )}
        </div>
      </div>
      <NavMenu
        active={windowWidth <= WINDOW_WIDTH_BREAKPOINT ? navActive : true}
      />
    </header>
  )
}
