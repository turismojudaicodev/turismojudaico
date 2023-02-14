const apiUrl =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api'

/**
 * Fetch strapi API content
 * @param {String} path Path relativo a la api de strapi sin primer slash
 * @param {String} params Parametros de la consulta
 * @param {Object} options Object con opciones para pasar al fetch nativo
 * @returns {Object} API data response Object
 */
async function fetchStrapi(path, params = null, options = {}) {
  if (!path) throw new Error('Path must be defined')

  let url
  if (params) {
    url = `${apiUrl}/${path}/${params}`
  } else {
    url = `${apiUrl}/${path}`
  }

  const response = await fetch(`${url}`, options)
  // Data es un objeto con data y metadata de la response, o data y error en caso de ocurrir alguno
  const data = await response.json()

  if (data.error) return { data: null, error: data.error }

  // Solo pasamos data
  return { data: data.data, error: null }
}

export { apiUrl, fetchStrapi }
