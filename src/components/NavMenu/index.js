// NPM
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
// Components
import Link from 'next/link'
// Styles
import utils from '@/styles/utils.module.css'
import styles from './NavMenu.module.css'

const LINKS = [
  {
    name: 'about',
    url: '/about',
  },
  {
    name: 'cityTours',
    url: '/tours',
  },
  {
    name: 'audioguides',
    url: '/audioguides',
  },
  {
    name: 'blogs',
    url: '/blogs',
  },
  {
    name: 'posts',
    url: '/posts',
  },
  {
    name: 'contact',
    url: '/contact',
  },
  {
    name: 'newsletter',
    url: '/newsletter',
  },
]

export default function NavMenu({ active }) {
  const [links, setLinks] = useState({})
  const { locale } = useRouter()

  useEffect(() => {
    async function fetchLocale() {
      const translation = await import(`public/locales/${locale}/common.json`)
      setLinks(translation.links)
    }
    fetchLocale()
  })

  return (
    <nav className={active ? styles.navActive : styles.navInactive}>
      <ul className={styles.navLinks}>
        {LINKS.map((link) => (
          <li key={link.url}>
            <Link href={`${link.url}`} replace className={utils.navButton}>
              {links[link.name] || link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
