'use client';

import Script from 'next/script';

// AdSense loads site-wide (verification + Auto Ads). Adsterra components
// stay gated behind NEXT_PUBLIC_ADS_ENABLED separately.
export default function AdSense() {
  return (
    <Script
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5451478429268021"
      strategy="lazyOnload"
      crossOrigin="anonymous"
    />
  );
}
