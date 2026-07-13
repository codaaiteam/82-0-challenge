'use client';

import { useEffect, useState } from 'react';
import AdsterraBanner300x250 from './AdsterraBanner300x250';

export default function GameWithSidebarAds({ children }) {
  const [screen, setScreen] = useState('mobile');

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w >= 768) setScreen('desktop');
      else if (w >= 480) setScreen('tablet');
      else setScreen('mobile');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <>
      <div style={{
        width: '100%',
        maxWidth: screen === 'desktop' ? '760px' : '650px',
        margin: '0 auto',
        padding: '0 1rem',
      }}>
        {children}
      </div>
      {screen === 'tablet' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <AdsterraBanner300x250 />
        </div>
      )}
    </>
  );
}
