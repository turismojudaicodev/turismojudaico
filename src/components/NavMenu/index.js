import Link from 'next/link'
import styles from './NavMenu.module.css'

const LINKS = [
  {
    title: 'quienes somos',
    url: '/about',
  },
  {
    title: 'city tours judios',
    url: 'citytours',
  },
  {
    title: 'audiogías',
    url: 'audioguides',
  },
  {
    title: 'blogs',
    url: 'blogs',
  },
  {
    title: 'atracciones judaicas',
    url: 'content',
  },
  {
    title: 'contacto',
    url: 'contact',
  },
  {
    title: 'newsletter',
    url: 'newsletter',
  },
]

export default function NavMenu({ active }) {
  return (
    <nav className={active ? styles.navActive : styles.navInactive}>
      <ul className={styles.navLinks}>
        {LINKS.map((link) => (
          <li key={link.url}>
            <Link href={link.url}>{link.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
