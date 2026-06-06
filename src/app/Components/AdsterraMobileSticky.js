'use client';

import { useEffect, useRef, useState } from 'react';

export default function AdsterraMobileSticky() {
  const containerRef = useRef(null);
  const loaded = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ADS_ENABLED !== '1') return;
    if (!isMobile || !containerRef.current || loaded.current) return;
    loaded.current = true;

    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.text = `
      atOptions = {
        'key' : 'f54fa52dcddc55689f0347ad5576da0d',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;
    containerRef.current.appendChild(configScript);

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/f54fa52dcddc55689f0347ad5576da0d/invoke.js';
    containerRef.current.appendChild(invokeScript);
  }, [isMobile]);

  if (process.env.NEXT_PUBLIC_ADS_ENABLED !== '1' || !isMobile) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 320,
        height: 50,
        background: '#000',
      }}
    />
  );
}
