import Link from 'next/link'
import styles from './Header.module.css'
import { useRouter } from 'next/router'
import { useState } from 'react'
import NavMenu from '@/components/NavMenu'

export default function Header() {
  const [navActive, setNavActive] = useState(false)

  const toggleNav = () => {
    setNavActive(prevState => !prevState)
  }

  const router = useRouter()

  const changeLang = (e) => {
    console.log(e.target)
    router.push(router.pathname, router.pathname, {
      locale: e.target.value
    })
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <select onChange={changeLang}>
          <option value="es">Español</option>
          <option value="en">Inglés</option>
        </select>
        <div onClick={toggleNav} className={ navActive ? styles.navButtonActive : styles.navButton }>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <NavMenu active={navActive} />
    </header>
  )
}