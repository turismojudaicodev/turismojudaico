import { NextResponse } from 'next/server'

export function middleware(req) {
  const user = req.cookies.get('user')?.value

  if (!user || JSON.parse(user).role !== 'admin') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
}

export const config = {
  matcher: '/admin/dashboard/:path*',
}
