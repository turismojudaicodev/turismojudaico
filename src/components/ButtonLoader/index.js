import Image from 'next/image'
import utils from '@/styles/utils.module.css'
import styles from './ButtonLoader.module.css'
import loadingIcon from 'public/icons/loading.svg'

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
          <Image src={loadingIcon} fill alt="Loading Icon" />
        </span>
      )}
    </button>
  )
}
