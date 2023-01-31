export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:1337/api'

const baseUrl = 'http://127.0.0.1:1337/api'

/**
 * Get full Strapi URL from path
 * @param {string} path Path of the url
 * @returns {string} Full Strapi URL
 */
export function getStrapiURL(path = '') {
  return `${
    process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
  }${path}`
}

export async function fetchQuery(path, params = null) {
  let url
  if (params !== null) {
    url = `${baseUrl}/${path}/${params}`
  } else {
    url = `${baseUrl}/${path}`
  }
  const response = await fetch(`${url}`)
  const data = await response.json()
  return data
}
