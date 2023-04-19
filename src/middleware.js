import { NextResponse } from 'next/server'

export function middleware(req) {
  const user = req.cookies.get('user')?.value

  if (req.nextUrl.pathname.startsWith('/admin/dashboard')) {
    if (!user || JSON.parse(user).role !== 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  } else if (req.nextUrl.pathname.startsWith('/admin')) {
    if (user && JSON.parse(user).role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
  }
}

export const config = {
  matcher: '/admin/:path*',
}
