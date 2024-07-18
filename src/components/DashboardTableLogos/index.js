// NPM
import { useState } from 'react'
// Local
import { deleteContent } from 'lib/api'
import DeleteIcon from 'public/icons/delete.svg'
import EditIcon from 'public/icons/edit.svg'
// Components
import Link from 'next/link'
import Notification, { NotificationLoading } from '../Notification'
// Styles
import styles from '@/styles/DashboardTable.module.css'
import dashboardStyles from '@/styles/Dashboard.module.css'

export default function DashboardTablePartners({
  table,
  setVisibleTable = null,
}) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async (itemId) => {
    setIsLoading(true)
    if (!confirm(`Está seguro de que desea borrar la entrada con id ${itemId}`))
      return
    const result = await deleteContent('/api/content/logos', itemId)
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
            <th>ID</th>
            <th>Nombre</th>
            <th>Imagen</th>
            <th>Orden</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {table.length > 0 ? (
            table.map((row) => (
              <tr key={row.codigo}>
                <td>{row.codigo}</td>
                <td className={styles.colTitle}>{row.nombre}</td>
                <td>
                  <img
                    src={row.imagen}
                    alt=""
                    width={50}
                    height={50}
                    style={{ aspectRatio: '1/1', objectFit: 'contain' }}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>{row.orden}</td>
                <td
                  style={{
                    textAlign: 'center',
                    color: row.estado == 1 ? 'green' : 'red',
                  }}
                >
                  {row.estado == 1 ? 'si' : 'no'}
                </td>
                <td>
                  <div
                    style={{
                      display: 'flex',
                      gap: '.25rem',
                      justifyContent: 'center',
                    }}
                  >
                    <Link
                      style={{
                        height: '1rem',
                        width: '1rem',
                        padding: '.65em',
                      }}
                      href={`/admin/dashboard/logos/${row.codigo}`}
                      className={dashboardStyles.editButton}
                      replace={false}
                    >
                      <img
                        src={EditIcon}
                        alt="Edit Icon"
                        height={12}
                        width={12}
                      />
                    </Link>
                    <button
                      style={{
                        height: '1rem',
                        width: '1rem',
                        padding: '.65em',
                      }}
                      className={dashboardStyles.deleteButton}
                      onClick={() => handleDelete(row.codigo)}
                    >
                      <img
                        src={DeleteIcon}
                        alt="Delete Icon"
                        height={12}
                        width={12}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td>No se encontraron resultados</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
