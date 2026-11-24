import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from 'lib/session'

const READ_METHODS = ['GET', 'HEAD', 'OPTIONS']

/** Indica si la ruta /api necesita sesión de admin. */
function apiNeedsAdmin(pathname, method) {
  if (pathname.startsWith('/api/admin')) return true
  // El contenido del sitio se lee sin login; crearlo, editarlo o borrarlo requiere admin.
  if (pathname.startsWith('/api/content')) return !READ_METHODS.includes(method)
  // Newsletter: solo la suscripción (POST /api/newsletter) es pública. Listar, exportar y borrar requieren admin.
  if (pathname.startsWith('/api/newsletter')) return !(pathname === '/api/newsletter' && method === 'POST')
  return false
}

function unauthorized() {
  return new NextResponse(JSON.stringify({ error: 'No autorizado' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  })
}

export async function middleware(req) {
  const { pathname } = req.nextUrl
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)

  if (pathname.startsWith('/api/')) {
    return apiNeedsAdmin(pathname, req.method) && !session ? unauthorized() : NextResponse.next()
  }

  if (pathname.startsWith('/admin/dashboard') && !session) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  if (pathname === '/admin' && session) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/content/:path*', '/api/newsletter/:path*'],
}
