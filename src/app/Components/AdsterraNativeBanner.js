'use client';

import Script from 'next/script';

export default function AdsterraNativeBanner() {
  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== '1') return null;
  return (
    <>
      <Script
        async
        data-cfasync="false"
        src="https://pl28901811.effectivegatecpm.com/8a2f34385a877f3fc500a950e8e68202/invoke.js"
        strategy="lazyOnload"
      />
      <div id="container-8a2f34385a877f3fc500a950e8e68202"></div>
    </>
  );
}
