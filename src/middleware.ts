import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  if (pathnameHasLocale) return

  // Locale-less paths serve English directly (root is the canonical English
  // home). Only redirect visitors whose browser asks for another language.
  const acceptLang = request.headers.get('accept-language')?.split(',')?.[0]?.split('-')?.[0] || 'en'
  if (acceptLang !== 'en' && locales.includes(acceptLang)) {
    return NextResponse.redirect(
      new URL(`/${acceptLang}${pathname === '/' ? '' : pathname}`, request.url)
    )
  }

  const response = NextResponse.next()
  response.headers.set('Vary', 'Accept-Language')
  return response
}

export const config = {
  matcher: [
    // Skip API routes, Next internals, and any path with a file extension (static assets)
    '/((?!api|_next|.*\\..*).*)',
  ],
}
