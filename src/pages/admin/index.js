// Components
import Layout from '@/components/Layout'
// Styles
import styles from '@/styles/Admin.module.css'
import utils from '@/styles/utils.module.css'

export default function Admin() {
  async function handleLogin(ev) {
    ev.preventDefault()
    const formData = Object.fromEntries(new FormData(ev.target))
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await res.json()
    console.log('response', data)
  }

  return (
    <Layout>
      <main className={`${utils.container} ${styles.main}`}>
        <form className={styles.form} onSubmit={handleLogin}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              className={utils.input}
            ></input>
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              className={utils.input}
            ></input>
          </div>
          <button type="submit" className={utils.button}>
            Login
          </button>
        </form>
      </main>
    </Layout>
  )
}
