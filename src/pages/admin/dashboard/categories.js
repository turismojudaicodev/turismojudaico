// NPM
import { useState } from 'react'
// Local
import { prisma } from 'lib/prisma'
import { deleteContent, postContent } from 'lib/api'
import { setTimedMessage } from 'helpers'
// Components
import AdminLayout from '@/components/AdminLayout'
import Image from 'next/image'
import Message from '@/components/Message'
import DeleteIcon from 'public/icons/delete.svg'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/Dashboard.module.css'

function ExistingContent({
  setVisibleCategories,
  visibleCategories,
  setVisibleSubCategories,
  visibleSubCategories,
}) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const handleCategoryDelete = async (categoryId) => {
    const result = await deleteContent('/api/content/categories', categoryId)
    const { message, error } = result
    if (error) return setTimedMessage(error, setErrorMessage)
    setTimedMessage(message, setInfoMessage)
    setVisibleCategories((prev) =>
      prev.filter((category) => category.id !== categoryId)
    )
    setVisibleSubCategories((prev) =>
      prev.filter((subCategory) => subCategory.category.id !== categoryId)
    )
  }

  const handleCityDelete = async (subCategoryId) => {
    const result = await deleteContent(
      '/api/content/subCategories',
      subCategoryId
    )
    const { message, error } = result
    if (error) return setTimedMessage(error, setErrorMessage)
    setTimedMessage(message, setInfoMessage)
    setVisibleSubCategories((prev) =>
      prev.filter((subCategory) => subCategory.id !== subCategoryId)
    )
  }

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div>
        {visibleCategories.map((category) => (
          <div
            className={styles.entryCard}
            key={category.id}
            style={{ alignItems: 'center' }}
          >
            <div className={styles.entryTextContainer}>
              <p>{category.name}</p>
            </div>
            <div className={styles.entryButtonsContainer}>
              <button
                className={styles.deleteButton}
                onClick={() => handleCategoryDelete(category.id)}
              >
                <Image
                  src={DeleteIcon}
                  alt="Delete Icon"
                  height={16}
                  width={16}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div>
        {visibleSubCategories.map((subCategory) => (
          <div
            className={styles.entryCard}
            key={subCategory.id}
            style={{ alignItems: 'center' }}
          >
            <div className={styles.entryTextContainer}>
              <p>{subCategory.name}</p>
              <p style={{ fontSize: '.75rem' }}>{subCategory.category.name}</p>
            </div>
            <div className={styles.entryButtonsContainer}>
              <button
                className={styles.deleteButton}
                onClick={() => handleCityDelete(subCategory.id)}
              >
                <Image
                  src={DeleteIcon}
                  alt="Delete Icon"
                  height={16}
                  width={16}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className={utils.messageContainer}>
        {errorMessage && <Message type="error" message={errorMessage} />}
        {infoMessage && <Message type="info" message={infoMessage} />}
      </div>
    </div>
  )
}

function Form({
  visibleCategories,
  setVisibileCategories,
  setVisibleSubCategories,
}) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const handleCategorySubmit = async (ev) => {
    ev.preventDefault()
    const category = Object.fromEntries(new FormData(ev.target))
    const response = await postContent('/api/content/categories', category)
    const { message, error, data } = response
    if (error) return setTimedMessage(error, setErrorMessage)
    setVisibileCategories((prev) => prev.concat(data))
    setTimedMessage(message, setInfoMessage)
  }

  const handleSubCategorySubmit = async (ev) => {
    ev.preventDefault()
    const subCategoryData = Object.fromEntries(new FormData(ev.target))
    const response = await postContent(
      '/api/content/subCategories',
      subCategoryData
    )
    const { message, error, data } = response
    if (error) return setTimedMessage(error, setErrorMessage)
    setVisibleSubCategories((prev) => prev.concat(data))
    setTimedMessage(message, setInfoMessage)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <form className={styles.formCreate} onSubmit={handleCategorySubmit}>
          <div>
            <label htmlFor="category">Categoría</label>
            <input
              type="text"
              name="name"
              id="category"
              className={styles.input}
              style={{ maxWidth: '350px' }}
            ></input>
          </div>
          <button type="submit" className={styles.submitButton}>
            Agregar
          </button>
        </form>
        <form className={styles.formCreate} onSubmit={handleSubCategorySubmit}>
          <div>
            <label htmlFor="subCategory">Sub Categoría</label>
            <input
              type="text"
              name="name"
              id="subCategory"
              className={styles.input}
              style={{ maxWidth: '350px' }}
            ></input>
          </div>
          <div>
            <label htmlFor="subCategoryCategory">Categoría</label>
            <select
              id="subCategoryCategory"
              name="categoryId"
              className={styles.input}
              style={{ maxWidth: '350px' }}
            >
              <option value=""> </option>
              {visibleCategories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={styles.submitButton}>
            Agregar
          </button>
        </form>
      </div>
      <div className={utils.messageContainer}>
        {errorMessage && <Message type="error" message={errorMessage} />}
        {infoMessage && <Message type="info" message={infoMessage} />}
      </div>
    </div>
  )
}

export default function Countries({ categories, subCategories }) {
  const [visibleCategories, setVisibileCategories] = useState(categories)
  const [visibleSubCategories, setVisibleSubCategories] =
    useState(subCategories)

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Categorías</h1>
      <Form
        visibleCategories={visibleCategories}
        setVisibileCategories={setVisibileCategories}
        setVisibleSubCategories={setVisibleSubCategories}
      />
      <ExistingContent
        setVisibleCategories={setVisibileCategories}
        visibleCategories={visibleCategories}
        visibleSubCategories={visibleSubCategories}
        setVisibleSubCategories={setVisibleSubCategories}
      />
    </AdminLayout>
  )
}

export async function getStaticProps() {
  const categories = await prisma.category.findMany()
  const subCategories = await prisma.subCategory.findMany({
    include: {
      category: true,
    },
  })

  return {
    props: {
      categories: JSON.parse(JSON.stringify(categories)),
      subCategories: JSON.parse(JSON.stringify(subCategories)),
    },
  }
}
