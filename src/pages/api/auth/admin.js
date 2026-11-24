import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { query } from 'lib/mysql'
import { createSessionToken, sessionCookieHeader } from 'lib/session'

// Límite simple de intentos fallidos por IP (en memoria: se reinicia con cada instancia del servidor).
const MAX_FAILURES = 10
const WINDOW_MS = 15 * 60 * 1000
const failures = new Map()

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim()
}

function isBlocked(ip) {
  const entry = failures.get(ip)
  if (!entry || Date.now() - entry.first > WINDOW_MS) return false
  return entry.count >= MAX_FAILURES
}

function registerFailure(ip) {
  const entry = failures.get(ip)
  if (!entry || Date.now() - entry.first > WINDOW_MS) failures.set(ip, { first: Date.now(), count: 1 })
  else entry.count += 1
}

const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$/.test(value)

// Compara en tiempo constante (vía hash) para no filtrar información por el tiempo de respuesta.
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

// Hash de relleno para que un usuario inexistente tarde lo mismo que uno existente.
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10)

// Largo de la columna `usuarios.clave`. Solo se guarda el hash si entra (bcrypt = 60 caracteres);
// en MariaDB no estricto un valor más largo se cortaría y la clave dejaría de funcionar.
let claveLength
async function canStoreHash() {
  if (claveLength === undefined) {
    const rows = await query(
      `SELECT CHARACTER_MAXIMUM_LENGTH AS len FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'clave'`
    )
    claveLength = Number(rows[0]?.len) || 0
  }
  return claveLength >= 60
}

async function checkPassword(user, password) {
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH)
    return false
  }
  if (isBcryptHash(user.clave)) return bcrypt.compare(password, user.clave)

  // Clave vieja en texto plano: se acepta y, si la columna ya lo permite, se reemplaza por su hash.
  if (!safeEqual(password, user.clave)) return false
  try {
    if (await canStoreHash()) {
      const hash = await bcrypt.hash(password, 12)
      await query('UPDATE usuarios SET clave = ? WHERE codigo = ? AND clave = ?', [hash, user.codigo, user.clave])
    }
  } catch (error) {
    console.error('Login: no se pudo guardar el hash de la clave', error)
  }
  return true
}

async function login(req, res) {
  const ip = clientIp(req)
  if (isBlocked(ip)) {
    return res.status(429).json({ error: 'Demasiados intentos. Probá de nuevo en unos minutos.' })
  }

  const { username, password } = req.body || {}
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ error: 'Ingresá usuario y contraseña' })
  }

  const rows = await query('SELECT codigo, usuario, clave FROM usuarios WHERE usuario = ? AND estado = 1 LIMIT 1', [
    username,
  ])
  const user = rows[0]

  if (!(await checkPassword(user, password))) {
    registerFailure(ip)
    return res.status(401).json({ error: 'Usuario o contraseña incorrecto' })
  }

  const token = await createSessionToken({ uid: user.codigo, username: user.usuario })
  if (!token) {
    console.error('Login: falta SESSION_SECRET (mínimo 32 caracteres)')
    return res.status(500).json({ error: 'El login no está configurado en el servidor' })
  }

  failures.delete(ip)
  // Además de la sesión nueva, se borra la cookie vieja `user` (tenía la contraseña en texto plano).
  res.setHeader('Set-Cookie', [sessionCookieHeader(token), 'user=; Path=/; Max-Age=0'])
  return res.status(200).json({ data: { username: user.usuario } })
}

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') return await login(req, res)
    if (req.method === 'DELETE') {
      res.setHeader('Set-Cookie', [sessionCookieHeader(null), 'user=; Path=/; Max-Age=0'])
      return res.status(200).json({ data: { loggedOut: true } })
    }
    res.setHeader('Allow', 'POST, DELETE')
    return res.status(405).json({ error: 'Método no permitido' })
  } catch (error) {
    console.error('Login: error', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
