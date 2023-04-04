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
  setVisibleCountries,
  visibleCountries,
  setVisibleCities,
  visibleCities,
}) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const handleCountryDelete = async (countryId) => {
    const result = await deleteContent('/api/content/countries', countryId)
    const { message, error } = result
    if (error) return setTimedMessage(error, setErrorMessage)
    setTimedMessage(message, setInfoMessage)
    setVisibleCountries((prev) =>
      prev.filter((country) => country.id !== countryId)
    )
    setVisibleCities((prev) =>
      prev.filter((city) => city.country.id !== countryId)
    )
  }

  const handleCityDelete = async (cityId) => {
    const result = await deleteContent('/api/content/cities', cityId)
    const { message, error } = result
    if (error) return setTimedMessage(error, setErrorMessage)
    setTimedMessage(message, setInfoMessage)
    setVisibleCities((prev) => prev.filter((city) => city.id !== cityId))
  }

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div>
        {visibleCountries.map((country) => (
          <div
            className={styles.entryCard}
            key={country.id}
            style={{ alignItems: 'center' }}
          >
            <div className={styles.entryTextContainer}>
              <p>{country.name}</p>
            </div>
            <div className={styles.entryButtonsContainer}>
              <button
                className={styles.deleteButton}
                onClick={() => handleCountryDelete(country.id)}
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
        {visibleCities.map((city) => (
          <div
            className={styles.entryCard}
            key={city.id}
            style={{ alignItems: 'center' }}
          >
            <div className={styles.entryTextContainer}>
              <p>{city.name}</p>
              <p style={{ fontSize: '.75rem' }}>{city.country.name}</p>
            </div>
            <div className={styles.entryButtonsContainer}>
              <button
                className={styles.deleteButton}
                onClick={() => handleCityDelete(city.id)}
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
      <div className={styles.messageContainer}>
        {errorMessage && <Message type="error" message={errorMessage} />}
        {infoMessage && <Message type="info" message={infoMessage} />}
      </div>
    </div>
  )
}

function Form({ visibleCountries, setVisibileCountries, setVisibleCities }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const handleCountrySubmit = async (ev) => {
    ev.preventDefault()
    const country = Object.fromEntries(new FormData(ev.target))
    const response = await postContent('/api/content/countries', country)
    const { message, error, data } = response
    if (error) return setTimedMessage(error, setErrorMessage)
    setVisibileCountries((prev) => prev.concat(data))
    setTimedMessage(message, setInfoMessage)
  }

  const handleCitySubmit = async (ev) => {
    ev.preventDefault()
    const cityData = Object.fromEntries(new FormData(ev.target))
    const response = await postContent('/api/content/cities', cityData)
    const { message, error, data } = response
    if (error) return setTimedMessage(error, setErrorMessage)
    setVisibleCities((prev) => prev.concat(data))
    setTimedMessage(message, setInfoMessage)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <form className={styles.formCreate} onSubmit={handleCountrySubmit}>
          <div>
            <label htmlFor="country">País</label>
            <input
              type="text"
              name="name"
              id="country"
              className={styles.input}
              style={{ maxWidth: '350px' }}
            ></input>
          </div>
          <button type="submit" className={styles.submitButton}>
            Agregar
          </button>
        </form>
        <form className={styles.formCreate} onSubmit={handleCitySubmit}>
          <div>
            <label htmlFor="city">Ciudad</label>
            <input
              type="text"
              name="name"
              id="city"
              className={styles.input}
              style={{ maxWidth: '350px' }}
            ></input>
          </div>
          <div>
            <label htmlFor="cityCountry">País</label>
            <select
              id="cityCountry"
              name="countryId"
              className={styles.input}
              style={{ maxWidth: '350px' }}
            >
              <option value=""> </option>
              {visibleCountries.map((country) => (
                <option value={country.id} key={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={styles.submitButton}>
            Agregar
          </button>
        </form>
      </div>
      <div className={styles.messageContainer}>
        {errorMessage && <Message type="error" message={errorMessage} />}
        {infoMessage && <Message type="info" message={infoMessage} />}
      </div>
    </div>
  )
}

export default function Countries({ countries, cities }) {
  const [visibleCountries, setVisibileCountries] = useState(countries)
  const [visibleCities, setVisibleCities] = useState(cities)

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Países</h1>
      <Form
        visibleCountries={visibleCountries}
        setVisibileCountries={setVisibileCountries}
        setVisibleCities={setVisibleCities}
      />
      <ExistingContent
        setVisibleCountries={setVisibileCountries}
        visibleCountries={visibleCountries}
        visibleCities={visibleCities}
        setVisibleCities={setVisibleCities}
      />
    </AdminLayout>
  )
}

export async function getStaticProps() {
  const countries = await prisma.country.findMany()
  const cities = await prisma.city.findMany({
    include: {
      country: true,
    },
  })

  return {
    props: {
      countries: JSON.parse(JSON.stringify(countries)),
      cities: JSON.parse(JSON.stringify(cities)),
    },
  }
}
