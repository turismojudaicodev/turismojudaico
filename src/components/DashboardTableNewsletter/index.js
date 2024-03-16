// NPM
import { useState } from 'react'
// Local
import { deleteContent } from 'lib/api'
import DeleteIcon from 'public/icons/delete.svg'
// Components
import Image from 'next/image'
import Notification, { NotificationLoading } from '../Notification'
// Styles
import styles from '../DashboardTableCities/DashboardTableCities.module.css'
import dashboardStyles from '@/styles/Dashboard.module.css'

export default function DashboardTableNewsletter({
  table,
  setVisibleTable = null,
}) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async (itemId) => {
    setIsLoading(true)
    if (
      !confirm(
        `Está seguro de que desea borrar la suscripción con id ${itemId}`
      )
    )
      return
    const result = await deleteContent(`/api/newsletter`, itemId)
    setIsLoading(false)
    const { message, error } = result
    if (error) return setErrorMessage(error)
    setInfoMessage(message)
    if (setVisibleTable)
      setVisibleTable((prev) => prev.filter((item) => item.codigo !== itemId))
  }

  return (
    <div>
      {isLoading && <NotificationLoading />}
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
      <table className={styles.table}>
        <thead>
          <tr>
            <th>id</th>
            <th>mail</th>
            <th>nombre</th>
            <th>estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row) => (
            <tr key={row.codigo}>
              <td>{row.codigo}</td>
              <td className={styles.colTitle}>{row.mail}</td>
              <td className={styles.colTitle}>{row.nombre}</td>
              <td style={{ textAlign: 'center' }}>{row.estado}</td>
              <td style={{ display: 'flex', gap: '.25em' }}>
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
