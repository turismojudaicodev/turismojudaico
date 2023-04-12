// NPM
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getCookie, setCookie, hasCookie } from 'cookies-next'
// Local
import { useUser } from 'context/user'
import { postContent } from 'lib/api'
// Styles
import styles from '@/styles/Admin.module.css'
import utils from '@/styles/utils.module.css'
import ButtonLoader from '@/components/ButtonLoader'

export function getServerSideProps({ req, res }) {
  let authorized = false

  const user = hasCookie('user')
    ? JSON.parse(getCookie('user', { req, res }))
    : null
  console.log('user', user)
  if (user && user.role.toLowerCase() === 'admin') authorized = true

  return {
    props: {
      authorized,
      user: authorized ? user : null,
    },
  }
}

export default function Admin({ authorized, user: authorizedUser }) {
  const { user, setUser } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const router = useRouter()

  useEffect(() => {
    if (authorized) {
      setUser(authorizedUser)
      router.push('/admin/dashboard')
    }
  }, [])

  async function handleLogin(ev) {
    ev.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    const formData = Object.fromEntries(new FormData(ev.target))
    const res = await postContent('/api/auth/admin', formData)
    const { data, error } = res
    setIsLoading(false)
    if (error) return setErrorMessage(error)
    setCookie('user', JSON.stringify(data))
    setUser(data)
    router.push('/admin/dashboard')
  }

  return (
    <main className={`${utils.container} ${styles.main}`}>
      <form className={styles.form} onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Usuario</label>
          <input
            type="text"
            name="username"
            id="username"
            className={utils.input}
          ></input>
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            name="password"
            id="password"
            className={utils.input}
          ></input>
        </div>
        <ButtonLoader isLoading={isLoading} attrs={{ type: 'submit' }}>
          Ingresar
        </ButtonLoader>
        {errorMessage ? <p style={{ color: 'red' }}>*{errorMessage}</p> : ''}
      </form>
    </main>
  )
}
