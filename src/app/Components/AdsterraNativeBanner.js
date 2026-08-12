'use client';

import Script from 'next/script';

export default function AdsterraNativeBanner() {
  if (process.env.NEXT_PUBLIC_ADS_ENABLED === '0') return null;
  return (
    <>
      <Script
        async
        data-cfasync="false"
        src="https://pl29670345.effectivecpmnetwork.com/0dc8d8892d7fe4c87c67429c6deb8823/invoke.js"
        strategy="lazyOnload"
      />
      <div id="container-0dc8d8892d7fe4c87c67429c6deb8823"></div>
    </>
  );
}
