import DashboardMenu from '../DashboardMenu'
import styles from './AdminLayout.module.css'

export default function AdminLayout({ children }) {
  return (
    <main className={styles.main}>
      <DashboardMenu />
      <section className={styles.contentSection}>{children}</section>
    </main>
  )
}
