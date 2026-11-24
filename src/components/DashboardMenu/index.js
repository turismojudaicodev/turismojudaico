import Link from 'next/link'
import styles from './DashboardMenu.module.css'
import utils from '@/styles/utils.module.css'

const DASHBOARD_SECTIONS = [
  {
    name: 'Inicio',
    url: '/',
  },
  {
    name: 'Blogs',
    url: '/blogs',
  },
  {
    name: 'Atracciones Judaicas',
    url: '/posts',
  },
  {
    name: 'Países',
    url: '/countries',
  },
  {
    name: 'Ciudades',
    url: '/cities',
  },
  {
    name: 'Categorías',
    url: '/categories',
  },
  {
    name: 'City Tours',
    url: '/tours',
  },
  {
    name: 'Quienes Somos',
    url: '/about',
  },
  {
    name: 'Logos',
    url: '/logos',
  },
  {
    name: 'Reservas',
    url: '/bookings',
  },
  {
    name: 'Newsletter',
    url: '/newsletter',
  },
  {
    name: 'Ajustes',
    url: '/settings',
  },
]

async function logout() {
  await fetch('/api/auth/admin', { method: 'DELETE' }).catch(() => {})
  window.location.href = '/admin'
}

export default function DashboardMenu() {
  return (
    <section className={styles.menu}>
      <h2 className={styles.menuTitle}>Menú</h2>
      <ul className={styles.navSectionList}>
        {DASHBOARD_SECTIONS.map((section) => (
          <li key={section.name}>
            <Link
              href={`/admin/dashboard${section.url}`}
              className={utils.navButton}
            >
              {section.name}
            </Link>
          </li>
        ))}
        <li>
          <button type="button" onClick={logout} className={utils.navButton}>
            Cerrar sesión
          </button>
        </li>
      </ul>
    </section>
  )
}
