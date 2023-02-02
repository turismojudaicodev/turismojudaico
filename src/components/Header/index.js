import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import useWidowSize from 'hooks/useWindowSize'
import Image from 'next/image'
import NavMenu from '@/components/NavMenu'
import styles from './Header.module.css'
import imgLogoSrc from '../../../public/images/logo.png'

const WINDOW_WIDTH_BREAKPOINT = 701

export default function Header() {
  const [navActive, setNavActive] = useState(false)
  const { width: windowWidth } = useWidowSize()

  const toggleNav = () => {
    setNavActive((prevState) => !prevState)
    console.log(windowWidth)
  }

  const changeLang = (e) => {
    console.log(e.target.value)
    // router.push(router.pathname, router.pathname, {
    //   locale: e.target.value
    // })
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
          <select onChange={changeLang} className={styles.languageSelector}>
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
