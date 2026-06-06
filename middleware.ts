import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    const acceptLang = request.headers.get('accept-language')?.split(',')?.[0]?.split('-')?.[0] || 'en'
    const finalLocale = locales.includes(acceptLang) ? acceptLang : 'en'

    return NextResponse.redirect(
      new URL(`/${finalLocale}${pathname}`, request.url)
    )
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|i/).*)',
  ],
}
