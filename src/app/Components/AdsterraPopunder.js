'use client';

import { useEffect, useRef } from 'react';

const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
const SCRIPT_URL = 'https://pl28902335.effectivegatecpm.com/29/9c/67/299c67d28688eaa2294a6cefddc9863c.js';

export default function AdsterraPopunder() {
  const fired = useRef(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ADS_ENABLED !== '1') return;
    if (fired.current) return;

    // Check 30-min cooldown
    const lastPop = localStorage.getItem('adsterra_pop_ts');
    if (lastPop && Date.now() - Number(lastPop) < COOLDOWN_MS) return;

    function onFirstClick() {
      document.removeEventListener('click', onFirstClick, true);
      if (fired.current) return;
      fired.current = true;
      localStorage.setItem('adsterra_pop_ts', String(Date.now()));

      // Load Adsterra script — it will register click handlers on document
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.type = 'text/javascript';
      document.head.appendChild(script);

      // After the first user click triggers the popunder, we need to nuke
      // all of Adsterra's click handlers. The only reliable way is to replace
      // the document's click event target by cloning the node.
      // But document/body can't be cloned, so instead we override window.open
      // after the first popup to prevent any more from opening.
      setTimeout(() => {
        const realOpen = window.open;
        let popCount = 0;
        window.open = function (...args) {
          popCount++;
          if (popCount > 1) {
            // Block subsequent popunders
            return null;
          }
          return realOpen.apply(window, args);
        };

        // Restore original window.open after cooldown period
        // so other legitimate window.open calls aren't affected
        setTimeout(() => {
          window.open = realOpen;
        }, 10000);
      }, 500);
    }

    document.addEventListener('click', onFirstClick, true);
    return () => document.removeEventListener('click', onFirstClick, true);
  }, []);

  return null;
}
