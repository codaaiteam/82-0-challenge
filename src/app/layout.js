import './globals.css'
import { Inter } from 'next/font/google'
// Social Bar / Mobile Sticky / Popunder 未在 Adsterra 为本域名建位，勿挂载

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
        <script defer data-domain="82-0-challenge.com" src="https://app.pageview.app/js/script.js"></script>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5451478429268021"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={inter.className}>
        {children}
        <noscript>
          <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1>82-0 Challenge — Play the Viral Team Builder Game</h1>
            <p>The 82-0 Challenge is a free browser game where you try to build a basketball lineup good enough to go undefeated for an entire 82-game season. Each round you get a random team and era, pick one player, and after five rounds the game simulates your final record. No downloads, no sign-ups — just open and play.</p>
            <h2>How to Play</h2>
            <p>Step 1: Get a random team and era. Step 2: Pick one player from the candidates. Step 3: Repeat until you have a 5-player lineup. Step 4: Get your simulated season record. Step 5: Share your result and challenge your friends to beat it.</p>
            <h2>Disclaimer</h2>
            <p>This is an independent fan-made style team builder game. It is not affiliated with, endorsed by, or sponsored by the NBA or any professional basketball league. All player archetypes are fictional.</p>
          </div>
        </noscript>
      </body>
    </html>
  )
}
