// NPM
import { useState } from 'react'
import { useRouter } from 'next/router'
// Local
import { deleteContent } from 'lib/api'
import EsFlag from 'public/icons/spain-flag.svg'
import UkFlag from 'public/icons/uk-flag.svg'
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
}) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const router = useRouter()

  const handleDelete = async (itemId) => {
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
              <td>{row.id}</td>
              <td>
                <div className={styles.colLocaleImgContainer}>
                  <Image
                    src={row.locale === 'es' ? EsFlag : UkFlag}
                    alt={row.locale}
                    fill
                  />
                </div>
              </td>
              <td className={styles.colTitle}>{row.title}</td>
              <td className={styles.colDescription}>{row.description}</td>
              <td>{row.image ?? 'null'}</td>
              {extraCols.countryId && <td>{row.countryId ?? 'null'}</td>}
              {extraCols.cityId && <td>{row.cityId ?? 'null'}</td>}
              {extraCols.categoryId && <td>{row.categoryId ?? 'null'}</td>}
              {extraCols.subCategoryId && (
                <td>{row.subCategoryId ?? 'null'}</td>
              )}
              <td style={{ textAlign: 'center' }}>
                {row.active ? '✅' : '❌'}
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
                  href={`${router.pathname}/${row.id}`}
                  className={dashboardStyles.editButton}
                  replace={false}
                >
                  <Image
                    src={EditIcon}
                    alt="Edit Icon"
                    height={16}
                    width={16}
                  />
                </Link>
                <button
                  className={dashboardStyles.deleteButton}
                  onClick={() => handleDelete(row.id)}
                >
                  <Image
                    src={DeleteIcon}
                    alt="Delete Icon"
                    height={16}
                    width={16}
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
