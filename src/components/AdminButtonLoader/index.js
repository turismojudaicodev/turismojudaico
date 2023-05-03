import styles from '@/styles/Dashboard.module.css'
import comp from './AdminButtonLoader.module.css'

export default function AdminButtonLoader({
  children,
  isLoading,
  loadingMessage = 'Cargando...',
  attrs,
}) {
  return (
    <button
      className={`${isLoading ? comp.loading : styles.submitButton}`}
      {...attrs}
    >
      {isLoading ? loadingMessage : children}
    </button>
  )
}
