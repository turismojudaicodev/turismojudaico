// NPM
import { useState } from 'react'
import { useRouter } from 'next/navigation'
// Local
import { useUser } from 'context/user'
import { postContent } from 'lib/api'
// Styles
import styles from '@/styles/Admin.module.css'
import utils from '@/styles/utils.module.css'
import ButtonLoader from '@/components/ButtonLoader'

export default function Admin() {
  const { setUser } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const router = useRouter()

  async function handleLogin(ev) {
    ev.preventDefault()
    setIsLoading(true)
    setErrorMessage('')
    const formData = Object.fromEntries(new FormData(ev.target))
    const res = await postContent('/api/auth/admin', formData)
    const { data, error } = res
    setIsLoading(false)
    if (error) return setErrorMessage(error)
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
