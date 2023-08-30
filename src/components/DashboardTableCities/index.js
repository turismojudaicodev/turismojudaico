// NPM
import { useState } from 'react'
import { useRouter } from 'next/router'
// Local
import { deleteContent } from 'lib/api'
import DeleteIcon from 'public/icons/delete.svg'
import EditIcon from 'public/icons/edit.svg'
import { setTimedMessage } from 'helpers'
// Components
import Image from 'next/image'
import Link from 'next/link'
import Message from '../Message'
// Styles
import styles from './DashboardTableCities.module.css'
import utils from '@/styles/utils.module.css'
import dashboardStyles from '@/styles/Dashboard.module.css'

export default function DashboardTableCities({
  table,
  setVisibleTable = null,
}) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const router = useRouter()

  const handleDelete = async (itemId) => {
    if (!confirm(`Está seguro de que desea borrar la entrada con id ${itemId}`))
      return
    const currentPath = router.pathname
    const tablePath = currentPath.substring(currentPath.lastIndexOf('/'))
    const result = await deleteContent(`/api/content${tablePath}`, itemId)
    const { message, error } = result
    if (error) return setTimedMessage(error, setErrorMessage)
    setTimedMessage(message, setInfoMessage)
    if (setVisibleTable)
      setVisibleTable((prev) => prev.filter((item) => item.codigo !== itemId))
  }

  return (
    <div>
      <div className={utils.messageContainer}>
        {errorMessage && <Message type="error" message={errorMessage} />}
        {infoMessage && <Message type="info" message={infoMessage} />}
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>id</th>
            <th>nombre</th>
            <th>codigoclima</th>
            <th>descripcion</th>
            <th>pais</th>
            <th>estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row) => (
            <tr key={row.codigo}>
              <td>{row.codigo}</td>
              <td className={styles.colTitle}>{row.nombre}</td>
              <td style={{ textAlign: 'center' }}>{row.codigoclima}</td>
              <td className={styles.colTitle}>{row.descripcion}</td>
              <td style={{ textAlign: 'center' }}>{row.pais}</td>
              <td style={{ textAlign: 'center' }}>{row.estado}</td>
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
