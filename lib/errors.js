function handleError(error) {
  let errorMessage

  if (error.status) {
    switch (error.status) {
      case 401:
        errorMessage = 'Error 401: No puede cargar el contenido'
        break
      case 404:
        errorMessage = 'Error 404: El contenido solicitado no existe'
        break
      case 500:
        errorMessage = 'Error 500: Error del servidor'
        break
      default:
        errorMessage = 'Error desconocido'
        break
    }
  } else {
    errorMessage = 'Error desconocido'
  }

  throw new Error(errorMessage)
}

export { handleError }
