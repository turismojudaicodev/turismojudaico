import Image from 'next/image'
import styles from './AdminButtonLoader.module.css'
import loadingIcon from 'public/icons/loading.svg'

export default function AdminButtonLoader({
  children,
  isLoading,
  loadingMessage = 'Cargando...',
  attrs,
}) {
  return (
    <button
      className={`${isLoading ? styles.loading : styles.button}`}
      {...attrs}
    >
      {isLoading ? (
        <div className={styles.loadingText}>
          <span className={styles.spinner}>
            <img
              src={loadingIcon}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              alt="Loading Icon"
            />
          </span>
          <span>{loadingMessage}</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
