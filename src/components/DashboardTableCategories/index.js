// NPM
import { useState } from 'react'
// Local
import { deleteContent } from 'lib/api'
import DeleteIcon from 'public/icons/delete.svg'
// Components
import Image from 'next/image'
import Notification, { NotificationLoading } from '../Notification'
// Styles
import styles from './DashboardTableCategories.module.css'
import dashboardStyles from '@/styles/Dashboard.module.css'

export default function DashboardTableCategories({
  table,
  setVisibleTable = null,
}) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async (itemId) => {
    if (
      !confirm(
        `¿Está seguro de que desea borrar la categoría con id ${itemId}?`
      )
    )
      return
    setIsLoading(true)
    const result = await deleteContent(`/api/content/categories`, itemId)
    setIsLoading(false)
    const { message, error } = result
    if (error) return setErrorMessage(error)
    setInfoMessage(message)
    if (setVisibleTable)
      setVisibleTable((prev) => prev.filter((item) => item.codigo !== itemId))
  }

  if (table.length === 0 || !table) {
    return <div>Tabla vacía</div>
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
          <tr>
            <th>id</th>
            <th>nombre</th>
            <th>nombre_en</th>
            <th>padre</th>
            <th>orden</th>
            <th>estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row) => (
            <tr key={row.codigo}>
              <td>{row.codigo}</td>
              <td>{row.nombre}</td>
              <td className={styles.colTitle}>{row.nombre_en}</td>
              <td style={{ textAlign: 'center' }}>{row.padre}</td>
              <td style={{ textAlign: 'center' }}>{row.orden}</td>
              <td style={{ textAlign: 'center' }}>{row.estado}</td>
              <td
                style={{
                  display: 'flex',
                  gap: '.25em',
                  justifyContent: 'center',
                }}
              >
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
