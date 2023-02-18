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

  const changeLang = (e) => {
    router.push(router.pathname, router.pathname, {
      locale: e.target.value,
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
            <div className={styles.logoContainer}>
              <Image src={imgLogoSrc} width={75} height={75} alt="Our logo" />
            </div>
          </Link>
        </div>
        <div className={styles.controlers}>
          <select
            onChange={changeLang}
            className={utils.input}
            defaultValue={router.locale}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
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
