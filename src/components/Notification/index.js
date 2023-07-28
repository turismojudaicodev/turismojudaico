import styles from './Notification.module.css'

export default function Notification({ notification, setNotification, type }) {
  const handleClick = () => {
    setNotification('')
  }

  return (
    <div
      className={
        type === 'error' ? styles.notificationError : styles.notification
      }
    >
      <span>{notification}</span>
      <button
        type="button"
        onClick={handleClick}
        className={type === 'error' ? styles.buttonError : styles.button}
      >
        X
      </button>
    </div>
  )
}
