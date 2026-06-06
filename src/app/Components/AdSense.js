'use client';

import Script from 'next/script';

export default function AdSense() {
  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== '1') return null;
  return (
    <Script
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5451478429268021"
      strategy="lazyOnload"
      crossOrigin="anonymous"
    />
  );
}
