export function formatDate(date) {
  const newDate = new Date(date)

  const options = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }

  return newDate.toLocaleDateString('es-ES', options)
}

/**
 *
 * @param {String} message The message that will be stored in the state
 * @param {Function} setMessage Callback function that will set the message
 * @param {Number} time Time to undo the message
 */
export function setTimedMessage(message, setMessage, time = 2000) {
  setMessage(message)
  setTimeout(() => {
    setMessage('')
  }, time)
}
