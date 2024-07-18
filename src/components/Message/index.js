import styles from './Message.module.css'
import infoIcon from 'public/icons/info.svg'
import errorIcon from 'public/icons/error.svg'
import warningIcon from 'public/icons/warning.svg'

export default function Message({ type, message }) {
  if (type !== 'warning' && type !== 'error' && type !== 'info')
    throw new Error('Incorrect message type')

  const icon = {
    info: infoIcon,
    warning: warningIcon,
    error: errorIcon,
  }

  return (
    <div className={`${styles[type]}`}>
      <p className={styles.message}>
        <img
          src={icon[type]}
          width={25}
          height={25}
          className={styles.icon}
          alt="Info icon"
        />
        {message}
      </p>
    </div>
  )
}
