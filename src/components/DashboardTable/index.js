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
import styles from './DashboardTable.module.css'
import utils from '@/styles/utils.module.css'
import dashboardStyles from '@/styles/Dashboard.module.css'

export default function DashboardTable({
  table,
  setVisibleTable,
  extraCols = {},
  idAlias = null,
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
    setVisibleTable((prev) => prev.filter((item) => item.id !== itemId))
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
            <th>Id</th>
            <th>Idioma</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Imagen</th>
            {extraCols.countryId && <th>País</th>}
            {extraCols.cityId && <th>Ciudad</th>}
            {extraCols.categoryId && <th>Categoría</th>}
            {extraCols.subCategoryId && <th>Sub Categoría</th>}
            <th>Activo</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row) => (
            <tr key={row.id}>
              <td>{idAlias ? row[idAlias] : row.id}</td>
              <td>{row.locale}</td>
              <td className={styles.colTitle}>{row.title}</td>
              <td className={styles.colDescription}>{row.description}</td>
              <td className={styles.colImage}>
                {row.image ? (
                  <Link
                    href={row.image}
                    target="_blank"
                    style={{ color: 'blue' }}
                  >
                    Ver
                  </Link>
                ) : (
                  '-'
                )}
              </td>
              {extraCols.countryId && <td>{row.countryId ?? '-'}</td>}
              {extraCols.cityId && <td>{row.cityId ?? '-'}</td>}
              {extraCols.categoryId && <td>{row.categoryId ?? '-'}</td>}
              {extraCols.subCategoryId && <td>{row.subCategoryId ?? '-'}</td>}
              <td style={{ textAlign: 'center' }}>
                {row.active ? 'si' : 'no'}
              </td>
              <td>
                {new Date(row.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                })}
              </td>
              <td style={{ display: 'flex', gap: '.25em' }}>
                <Link
                  style={{ height: '1rem', width: '1rem', padding: '.65em' }}
                  href={`${router.pathname}/${idAlias ? row[idAlias] : row.id}`}
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
                  onClick={() => handleDelete(idAlias ? row[idAlias] : row.id)}
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
