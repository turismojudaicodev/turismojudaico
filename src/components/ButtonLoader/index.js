import utils from '@/styles/utils.module.css'
import styles from './ButtonLoader.module.css'
import loadingIcon from '/public/icons/loading.svg'

export default function ButtonLoader({
  children,
  isLoading = false,
  attrs = {},
}) {
  return (
    <button className={`${utils.button} ${styles.button}`} {...attrs}>
      <span style={{ color: isLoading ? 'transparent' : 'inherit' }}>
        {children}
      </span>
      {isLoading && (
        <span className={styles.spinner}>
          <img
            src={loadingIcon.src}
           style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            alt="Loading Icon"
          />
        </span>
      )}
    </button>
  )
}
