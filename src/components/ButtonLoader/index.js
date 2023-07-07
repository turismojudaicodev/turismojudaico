import Image from 'next/image'
import utils from '@/styles/utils.module.css'
import styles from './ButtonLoader.module.css'
import loadingIcon from 'public/icons/loading.svg'

export default function ButtonLoader(props) {
  if (props.isLoading && !props.loadingMessage)
    throw new Error('Loading message must be provided')

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
