import utils from '@/styles/utils.module.css'
import styles from './ButtonLoader.module.css'

export default function ButtonLoader({
  children,
  isLoading = false,
  attrs = {},
}) {
  return (
    <button className={utils.button} {...attrs}>
      {isLoading ? <div className={styles.loadingSpinner}></div> : children}
    </button>
  )
}
