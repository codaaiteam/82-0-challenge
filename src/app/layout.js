import './globals.css'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import CookieNotice from './Components/CookieNotice'
import AdsterraSidebar from './Components/AdsterraSidebar'
// Social Bar / Mobile Sticky / Popunder 未在 Adsterra 为本域名建位，勿挂载
// AnnouncementBar(x-0-game.com 导流条)已于 AdSense 复审期间移除——恢复时
// 需同步把 Header top 调回 36px、mainContent padding-top 调回 92px

import en from '../locales/en.json'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.82-0-challenge.com'

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: en.seoTitle,
  description: en.seoDescription,
  keywords: en.keywords,
}

export default function RootLayout({ children, params }) {
  return (
    <html lang={params?.lang || 'en'}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <Script
          strategy="afterInteractive"
          data-domain="82-0-challenge.com"
          src="https://app.pageview.app/js/script.js"
        />
        <Script
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5451478429268021"
          crossOrigin="anonymous"
        />
        <aside className="global-ad-rail global-ad-rail-left" aria-label="Advertisement">
          <AdsterraSidebar />
        </aside>
        <aside className="global-ad-rail global-ad-rail-right" aria-label="Advertisement">
          <AdsterraSidebar />
        </aside>
        {children}
        <CookieNotice />
        <noscript>
          <p style={{ padding: '1rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
            This game requires JavaScript. Please enable JavaScript to play.
          </p>
        </noscript>
      </body>
    </html>
  )
}
