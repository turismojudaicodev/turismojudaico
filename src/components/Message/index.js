import styles from './Message.module.css'
import infoCircleIcon from 'public/icons/info-circle.svg'
import Image from 'next/image'

export default function Message({ type, message }) {
  if (type !== 'warning' && type !== 'error' && type !== 'info')
    throw new Error('Incorrect message type')

  return (
    <div className={`${styles[type]}`}>
      <p className={styles.message}>
        <Image
          src={infoCircleIcon}
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
