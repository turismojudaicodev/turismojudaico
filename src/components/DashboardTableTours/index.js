// NPM
import { useEffect, useState } from 'react'
// Local
import { deleteContent } from 'lib/api'
import DeleteIcon from 'public/icons/delete.svg'
import EditIcon from 'public/icons/edit.svg'
// Components
import Link from 'next/link'
import Notification, { NotificationLoading } from '../Notification'
// Styles
import styles from './DashboardTableTours.module.css'
import dashboardStyles from '@/styles/Dashboard.module.css'

export default function DashboardTableTours({ table, setVisibleTable = null }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async (itemId) => {
    if (!confirm(`Está seguro de que desea borrar el tour con id ${itemId}`))
      return
    setIsLoading(true)
    const result = await deleteContent('/api/content/tours', itemId)
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
      {isLoading && <NotificationLoading message="Borrando tour" />}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>id</th>
            <th>nombre</th>
            <th>nombre_en</th>
            <th>pais</th>
            <th>ciudad</th>
            <th>
              home
              <br />
              grande
            </th>
            <th>
              home
              <br />
              chico
            </th>
            <th>orden</th>
            <th>activo</th>
            <th>fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row) => (
            <tr key={row.codigo}>
              <td>{row.codigo}</td>
              <td className={styles.colTitle}>{row.nombre}</td>
              <td className={styles.colTitle}>{row.nombre_en}</td>
              <td style={{ maxWidth: '16ch' }}>{row.pais}</td>
              <td style={{ maxWidth: '20ch' }}>{row.ciudad}</td>
              <td style={{ textAlign: 'center' }}>
                {row.destacadohomegrande == 1 ? 'si' : ''}
              </td>
              <td style={{ textAlign: 'center' }}>
                {row.destacadohomechico == 1 ? 'si' : ''}
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
                  href={`/admin/dashboard/tours/${row.codigo}`}
                  className={dashboardStyles.editButton}
                  replace={false}
                >
                  <img src={EditIcon.src} alt="Edit Icon" height={12} width={12} />
                </Link>
                <button
                  style={{ height: '1rem', width: '1rem', padding: '.65em' }}
                  className={dashboardStyles.deleteButton}
                  onClick={() => handleDelete(row.codigo)}
                >
                  <img
                    src={DeleteIcon.src}
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
