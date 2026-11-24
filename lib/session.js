// Sesión de admin: un token firmado con HMAC-SHA256 en una cookie httpOnly.
// Usa solo Web Crypto para funcionar igual en el middleware (Edge) y en las rutas /api (Node).

export const SESSION_COOKIE = 'tj_session'
export const SESSION_MAX_AGE = 60 * 60 * 12 // 12 horas

const encoder = new TextEncoder()

function getSecret() {
  const secret = process.env.SESSION_SECRET
  // Sin secreto (o uno corto) no se acepta ni se crea ninguna sesión: falla cerrado.
  return secret && secret.length >= 32 ? secret : null
}

function toBase64Url(bytes) {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text) {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function getKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

/** Crea el token de sesión. Devuelve null si falta SESSION_SECRET. */
export async function createSessionToken({ uid, username }) {
  const secret = getSecret()
  if (!secret) return null
  const payload = { uid, username, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE }
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign('HMAC', await getKey(secret), encoder.encode(body))
  return `${body}.${toBase64Url(new Uint8Array(signature))}`
}

/** Devuelve los datos de la sesión si el token es válido y no venció; si no, null. */
export async function verifySessionToken(token) {
  const secret = getSecret()
  if (!secret || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  try {
    const [body, signature] = parts
    const valid = await crypto.subtle.verify('HMAC', await getKey(secret), fromBase64Url(signature), encoder.encode(body))
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body)))
    if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null
    return payload
  } catch {
    return null
  }
}

/** Cabecera Set-Cookie para la sesión (o para borrarla si token es null). */
export function sessionCookieHeader(token) {
  const parts = [
    `${SESSION_COOKIE}=${token ?? ''}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${token ? SESSION_MAX_AGE : 0}`,
  ]
  if (process.env.NODE_ENV === 'production') parts.push('Secure')
  return parts.join('; ')
}

/** Para rutas /api (Node): lee la cookie del pedido y devuelve la sesión o null. */
export async function getSession(req) {
  return verifySessionToken(req.cookies?.[SESSION_COOKIE])
}

/**
 * Envuelve un handler de /api para que exija sesión de admin.
 * El middleware ya lo controla; esto es una segunda barrera por si el middleware no corre.
 */
export function withAdmin(handler) {
  return async function adminHandler(req, res) {
    const session = await getSession(req)
    if (!session) return res.status(401).json({ error: 'No autorizado' })
    req.session = session
    return handler(req, res)
  }
}
