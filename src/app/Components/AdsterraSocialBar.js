'use client';

import { useEffect, useRef } from 'react';

const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

export default function AdsterraSocialBar() {
  const loaded = useRef(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ADS_ENABLED !== '1') return;
    if (loaded.current) return;

    const lastLoad = localStorage.getItem('adsterra_sb_ts');
    if (lastLoad && Date.now() - Number(lastLoad) < COOLDOWN_MS) return;

    loaded.current = true;
    localStorage.setItem('adsterra_sb_ts', String(Date.now()));

    const script = document.createElement('script');
    script.src = 'https://pl28902347.effectivegatecpm.com/87/8e/1a/878e1aa47ff7232a16bc564c71bd87aa.js';
    script.type = 'text/javascript';
    document.body.appendChild(script);
  }, []);

  return null;
}
