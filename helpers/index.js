export function formatDate(date, locale = 'es-ES') {
  const newDate = new Date(date)

  const options = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }

  return newDate.toLocaleDateString(locale, options)
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

export function isNumeric(str) {
  if (typeof str != 'string') return false
  return (
    !isNaN(str) && // use type coercion to parse the entirety of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  )
}

export async function uploadCloudinaryImage(image) {
  const fd = new FormData()
  fd.append('file', image)
  fd.append('upload_preset', 'tj_local')
  const data = await fetch(
    'https://api.cloudinary.com/v1_1/paiput/image/upload',
    {
      method: 'POST',
      body: fd,
    }
  ).then((r) => r.json())
  return data
}

export async function handleCloudinaryUpload(image) {
  if (image.size > 0) {
    const data = await uploadCloudinaryImage(image)
    return data.secure_url
  }
  return ''
}

export function isLocalImage(image) {
  return !image.includes('http://') && !image.includes('https://')
}

export function isValidImage(image) {
  return image !== null && image !== undefined
}

export function setImageSrc(image, path = undefined) {
  if (!isValidImage(image)) return '/images/logo.png'
  if (isLocalImage(image)) {
    if (!path) return '/images/logo.png'
    return `/images/uploads/${path}/${image}`
  }
  return image
}
