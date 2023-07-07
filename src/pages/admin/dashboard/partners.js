// Components
import AdminLayout from '@/components/AdminLayout'
// Styles
import utils from '@/styles/utils.module.css'
import styles from '@/styles/DashboardIndex.module.css'
import dashboardStyles from '@/styles/Dashboard.module.css'

export default function Partners() {
  const handleSliderFormSubmit = (ev) => {
    ev.preventDefault()
    const formData = Object.fromEntries(new FormData(ev.target))
    alert(JSON.stringify(formData))
  }

  return (
    <AdminLayout>
      <h1 className={utils.bigTitle}>Logos comunitarios</h1>
      <div>
        <h2>Agregue la url de los logos</h2>
        <form onSubmit={handleSliderFormSubmit} className={styles.form}>
          {new Array(10).fill(1).map((el, index) => (
            <div className={styles.inputContainer} key={index}>
              <label htmlFor={`image${index + 1}`}>Imagen {index + 1}</label>
              <input
                type="text"
                name={`image${index + 1}`}
                id={`image${index + 1}`}
                className={utils.input}
                placeholder="agregar url"
              />
            </div>
          ))}
          <button type="submit" className={dashboardStyles.submitButton}>
            Aplicar
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
