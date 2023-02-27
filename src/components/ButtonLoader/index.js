import utils from '@/styles/utils.module.css'
import styles from './ButtonLoader.module.css'

export default function ButtonLoader(props) {
  if (props.isLoading && !props.loadingMessage)
    throw new Error('Loading message must be provided')

  return (
    <button
      className={`${utils.button} ${
        props.isLoading ? styles.loadingButton : styles.button
      }`}
      {...props.attributes}
    >
      {props.isLoading ? (
        <>
          <span className={styles.loadingSpinner}></span>
          {props.loadingMessage}
        </>
      ) : (
        <span>{props.children}</span>
      )}
    </button>
  )
}
