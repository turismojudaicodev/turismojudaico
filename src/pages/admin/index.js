import styles from '@/styles/Admin.module.css'
import { useState } from 'react'
import utils from '@/styles/utils.module.css'

export default function Admin() {
  const [error, setError] = useState(null)

  const handleLogin = (ev) => {
    ev.preventDefault()
    const formData = Object.fromEntries(new FormData(ev.target))
    if (formData.username != 'admin')
      setError('Usuario o contraseña incorrectos')
  }

  return (
    <main>
      <form onSubmit={handleLogin} className={styles.form}>
        <div>
          <label htmlFor="username">Usuario:</label>
          <input
            id="username"
            name="username"
            type="text"
            className={utils.input}
          ></input>
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            name="password"
            type="password"
            className={utils.input}
          ></input>
        </div>
        <button type="submit" className={utils.button}>
          Ingresar
        </button>
      </form>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </main>
  )
}
