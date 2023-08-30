// NPM
import { useEffect, useState } from 'react'
// Local
import { getContent, postContent } from 'lib/api'
// Components
import AdminLayout from '@/components/AdminLayout'
import Notification from '@/components/Notification'
import DashboardTableCategories from '@/components/DashboardTableCategories'
import AdminButtonLoader from '@/components/AdminButtonLoader'
import { InputNumber, InputText } from '@/components/DashboardComponents'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function ExistingContent({ setVisibleCategories, visibleCategories }) {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div>
        <DashboardTableCategories
          table={visibleCategories}
          setVisibleTable={setVisibleCategories}
        />
      </div>
    </div>
  )
}

function Form({ setVisibileCategories }) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const handleCategorySubmit = async (ev) => {
    ev.preventDefault()
    setIsLoading(true)
    const category = Object.fromEntries(new FormData(ev.target))
    const response = await postContent('/api/content/categories', category)
    setIsLoading(false)
    const { message, error, data } = response
    if (error) {
      return setErrorMessage(error)
    }
    setVisibileCategories((prev) =>
      prev.concat({ ...category, codigo: data.insertId })
    )
    setInfoMessage(message)
    document.getElementById('category-form').reset()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <form
          className={styles.formCreate}
          onSubmit={handleCategorySubmit}
          id="category-form"
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div>
              <InputText name="nombre" label="Categoría" />
              <InputText name="nombre_en" label="Categoría en inglés" />
            </div>
            <div>
              <InputNumber name="padre" label="Padre" />
              <InputNumber name="orden" label="Orden" />
              <InputNumber name="estado" label="Estado" />
            </div>
          </div>
          <AdminButtonLoader
            attrs={{ type: 'submit', style: { width: 'fit-content' } }}
            isLoading={isLoading}
          >
            Agregar
          </AdminButtonLoader>
        </form>
      </div>
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
    </div>
  )
}

export default function Categories() {
  const [visibleCategories, setVisibileCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function fetchData() {
      await getContent('/api/content/categories')
        .then(({ data }) => setVisibileCategories(data))
        .catch((error) => setErrorMessage(error))
      setIsLoading(false)
    }
    setIsLoading(true)
    fetchData()
  }, [])

  if (isLoading)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Categorías</h1>
        <p>Cargando categorias...</p>
      </AdminLayout>
    )

  if (errorMessage.length > 0)
    return (
      <AdminLayout>
        <h1 className={utils.bigTitle}>Categorías</h1>
        <p>{errorMessage}</p>
      </AdminLayout>
    )

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Categorías</h1>
      <Form setVisibileCategories={setVisibileCategories} />
      <ExistingContent
        setVisibleCategories={setVisibileCategories}
        visibleCategories={visibleCategories}
      />
    </AdminLayout>
  )
}
