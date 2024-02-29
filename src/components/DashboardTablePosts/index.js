// NPM
import { useEffect, useState } from 'react'
// Local
import { deleteContent } from 'lib/api'
import DeleteIcon from 'public/icons/delete.svg'
import EditIcon from 'public/icons/edit.svg'
import { getContent } from 'lib/api'
// Components
import Image from 'next/image'
import Link from 'next/link'
import Notification, { NotificationLoading } from '../Notification'
import { Select } from '../DashboardComponents'
// Styles
import styles from '@/styles/DashboardTable.module.css'
import dashboardStyles from '@/styles/Dashboard.module.css'
import utils from '@/styles/utils.module.css'

export default function DashboardTablePosts({ table, setVisibleTable = null }) {
  const [filteredTable, setFilteredTable] = useState(table)

  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])

  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isFormLoading, setIsFormLoading] = useState(false)

  useEffect(() => {
    async function fetchPostContent() {
      await getContent('/api/content/countries').then(({ data }) =>
        setCountries(data)
      )
      await getContent('/api/content/cities?populate=pais').then(({ data }) =>
        setCities(data)
      )
      await getContent('/api/content/categories').then(({ data }) =>
        setCategories(data)
      )
      setIsFormLoading(false)
    }
    setIsFormLoading(true)
    fetchPostContent()
  }, [])

  const handleDelete = async (itemId) => {
    setIsLoading(true)
    if (!confirm(`Está seguro de que desea borrar la entrada con id ${itemId}`))
      return
    const result = await deleteContent('/api/content/posts', itemId)
    setIsLoading(false)
    const { message, error } = result
    if (error) return setErrorMessage(error)
    setInfoMessage(message)
    if (setVisibleTable)
      setVisibleTable((prev) => prev.filter((item) => item.codigo !== itemId))
  }

  const handleFilters = (ev) => {
    ev.preventDefault()
    setFilteredTable(() => {
      if (selectedCountry && selectedCountry != '0')
        table = table.filter((row) => row.pais == selectedCountry)
      if (selectedCity && selectedCity != '0')
        table = table.filter((row) => row.ciudad == selectedCity)
      if (selectedCategory && selectedCategory != '0')
        table = table.filter((row) => row.categoria == selectedCategory)
      return table
    })
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
      {isFormLoading ? (
        <div
          className={utils.loadingSpinner}
          style={{ marginBlock: '1rem' }}
        ></div>
      ) : (
        <form onSubmit={handleFilters} style={{ marginBlock: '2rem' }}>
          <h3>Filtrar por:</h3>
          <div style={{ marginTop: '.75rem' }}>
            <Select
              label="País"
              options={countries.map((country) => ({
                codigo: country.nombre,
                nombre: country.nombre,
              }))}
              attrs={{
                onChange: (ev) => {
                  setSelectedCountry(ev.target.value)
                },
              }}
            />
          </div>
          <div style={{ marginTop: '.75rem' }}>
            <Select
              label="Ciudad"
              options={cities
                .filter((city) => city.nombre_pais == selectedCountry)
                .map((city) => ({
                  codigo: city.nombre,
                  nombre: city.nombre,
                }))}
              attrs={{
                onChange: (ev) => {
                  setSelectedCity(ev.target.value)
                },
              }}
            />
          </div>
          <div style={{ marginTop: '.75rem' }}>
            <Select
              label="Categoría"
              options={categories.map((category) => ({
                codigo: category.nombre,
                nombre: category.nombre,
              }))}
              attrs={{
                onChange: (ev) => {
                  setSelectedCategory(ev.target.value)
                },
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
            <button className={dashboardStyles.submitButton} type="submit">
              Aplicar
            </button>
            <button
              className={dashboardStyles.submitButton}
              type="button"
              onClick={() => setFilteredTable(table)}
            >
              Limpiar filtros
            </button>
          </div>
        </form>
      )}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Nombre_en</th>
            <th>País</th>
            <th>Ciudad</th>
            <th>Categoría</th>
            <th>Orden</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredTable.length > 0 ? (
            filteredTable.map((row) => (
              <tr key={row.codigo}>
                <td>{row.codigo}</td>
                <td className={styles.colTitle}>{row.nombre}</td>
                <td className={styles.colTitle}>{row.nombre_en}</td>
                <td>{row.pais}</td>
                <td>{row.ciudad}</td>
                <td>{row.categoria}</td>
                <td style={{ textAlign: 'center' }}>{row.orden}</td>
                <td
                  style={{
                    textAlign: 'center',
                    color: row.estado == 1 ? 'green' : 'red',
                  }}
                >
                  {row.estado == 1 ? 'si' : 'no'}
                </td>
                <td style={{ display: 'flex', gap: '.25em' }}>
                  <Link
                    style={{ height: '1rem', width: '1rem', padding: '.65em' }}
                    href={`/admin/dashboard/posts/${row.codigo}`}
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
