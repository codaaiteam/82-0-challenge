'use client';

import { useEffect, useRef } from 'react';

export default function AdsterraBanner300x250() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ADS_ENABLED !== '1') return;
    if (!containerRef.current) return;
    // Only inject once
    if (containerRef.current.querySelector('script')) return;

    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.text = `
      atOptions = {
        'key' : 'dd7047d0467ed51f9e99e52601e554d9',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    containerRef.current.appendChild(configScript);

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/dd7047d0467ed51f9e99e52601e554d9/invoke.js';
    containerRef.current.appendChild(invokeScript);
  }, []);

  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== '1') return null;

  return (
    <div ref={containerRef} style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }} />
  );
}
