import { NextResponse } from 'next/server'

/** Devuelve true si la cookie `user` corresponde a un admin. Una cookie inválida cuenta como no logueado. */
function isAdmin(req) {
  try {
    const user = JSON.parse(req.cookies.get('user')?.value ?? 'null')
    return user?.role?.toUpperCase() === 'ADMIN'
  } catch {
    return false
  }
}

export function middleware(req) {
  const { pathname } = req.nextUrl
  const loggedIn = isAdmin(req)

  if (pathname.startsWith('/admin/dashboard') && !loggedIn) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  if (pathname === '/admin' && loggedIn) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }
}

export const config = {
  matcher: '/admin/:path*',
}
