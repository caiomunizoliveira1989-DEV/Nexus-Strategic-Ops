import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIES = ['authjs.session-token', '__Secure-authjs.session-token']
const PUBLIC_PATHS = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { nextUrl } = request
  const name = nextUrl.pathname

  const hasSession = SESSION_COOKIES.some((cookie) => request.cookies.has(cookie))
  const isPublic = PUBLIC_PATHS.some((path) => name.startsWith(path))

  if (isPublic) {
    // removido: nao redirecionar /login -> / so porque existe cookie
    // (cookie invalido gerava loop /profile -> /login -> /)
    return NextResponse.next()
  }

  if (!hasSession) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', `${name}${nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
  ],
}
