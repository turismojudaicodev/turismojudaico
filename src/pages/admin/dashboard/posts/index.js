// NPM
import { useEffect, useState } from 'react'
// Local
import { getContent } from 'lib/api'
// Components
import DashboardTablePosts from '@/components/DashboardTablePosts'
import AdminLayout from '@/components/AdminLayout'
import { NotificationLoading } from '@/components/Notification'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'
import Link from 'next/link'

function ExistingPosts({ posts, setVisiblePosts }) {
  return (
    <>
      <h2 className={styles.actionTitle}>Atracciones</h2>
      <DashboardTablePosts table={posts} setVisibleTable={setVisiblePosts} />
    </>
  )
}

export default function Dashboard() {
  const [visiblePosts, setVisiblePosts] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchPostContent() {
      await getContent('/api/content/posts/table').then(({ data }) =>
        setVisiblePosts(data)
      )
      setIsLoading(false)
    }
    setIsLoading(true)
    fetchPostContent()
  }, [])

  if (isLoading)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Atracciones Judaicas</h1>
        <NotificationLoading message="Cargando posts" />
      </AdminLayout>
    )

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Atracciones Judaicas</h1>
      <Link href="" className={styles.actionButtonSelected}>
        Mostar Posts
      </Link>
      <Link
        href="/admin/dashboard/posts/create"
        className={styles.actionButton}
      >
        Crear Post
      </Link>
      <ExistingPosts posts={visiblePosts} setVisiblePosts={setVisiblePosts} />
    </AdminLayout>
  )
}
