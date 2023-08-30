// NPM
import { useState } from 'react'
import { useRouter } from 'next/router'
// Local
import { deleteContent } from 'lib/api'
import DeleteIcon from 'public/icons/delete.svg'
import EditIcon from 'public/icons/edit.svg'
// Components
import Image from 'next/image'
import Link from 'next/link'
import Notification, { NotificationLoading } from '@/components/Notification'
// Styles
import styles from './DashboardTableBlogs.module.css'
import dashboardStyles from '@/styles/Dashboard.module.css'

export default function DashboardTable({ table, setVisibleTable = null }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleDelete = async (itemId) => {
    if (!confirm(`Está seguro de que desea borrar la entrada con id ${itemId}`))
      return
    setIsLoading(true)
    const result = await deleteContent(`/api/content/blogs`, itemId)
    setIsLoading(false)
    const { message, error } = result
    if (error) return setErrorMessage(error)
    setInfoMessage(message)
    if (setVisibleTable)
      setVisibleTable((prev) => prev.filter((item) => item.codigo !== itemId))
  }

  return (
    <div>
      {errorMessage && (
        <Notification
          type="error"
          notification={errorMessage}
          setNotification={setErrorMessage}
        />
      )}
      {infoMessage && (
        <Notification
          notification={infoMessage}
          setNotification={setInfoMessage}
        />
      )}
      {isLoading && <NotificationLoading />}
      <table className={styles.table}>
        <thead>
          <tr style={{ overflowX: 'scroll' }}>
            <th>id</th>
            <th>nombre</th>
            <th>nombre_en</th>
            <th>imagen</th>
            <th>imagen_en</th>
            <th>estado</th>
            <th>fechacreacion</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row) => (
            <tr key={row.codigo}>
              <td>{row.codigo}</td>
              <td className={styles.colTitle}>{row.nombre}</td>
              <td className={styles.colTitle}>{row.nombre_en}</td>
              <td className={styles.colDescription}>{row.imagen}</td>
              <td className={styles.colImage}>{row.imagen_en}</td>
              <td style={{ textAlign: 'center' }}>{row.estado}</td>
              <td style={{ textAlign: 'center' }}>
                {new Date(row.fechacreacion).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                })}
              </td>
              <td style={{ display: 'flex', gap: '.25em' }}>
                <Link
                  style={{ height: '1rem', width: '1rem', padding: '.65em' }}
                  href={`${router.pathname}/${row.codigo}`}
                  className={dashboardStyles.editButton}
                  replace={false}
                >
                  <Image
                    src={EditIcon}
                    alt="Edit Icon"
                    height={12}
                    width={12}
                  />
                </Link>
                <button
                  style={{ height: '1rem', width: '1rem', padding: '.65em' }}
                  className={dashboardStyles.deleteButton}
                  onClick={() => handleDelete(row.codigo)}
                >
                  <Image
                    src={DeleteIcon}
                    alt="Delete Icon"
                    height={12}
                    width={12}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
