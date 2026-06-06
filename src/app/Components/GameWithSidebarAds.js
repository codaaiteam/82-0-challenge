'use client';

import { useEffect, useState } from 'react';
import AdsterraSidebar from './AdsterraSidebar';
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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '1rem',
        width: '100%',
        maxWidth: screen === 'desktop' ? '1020px' : '650px',
        margin: '0 auto',
        padding: '0 1rem',
      }}>
        {screen === 'desktop' && (
          <div style={{ position: 'sticky', top: '60px', flexShrink: 0 }}>
            <AdsterraSidebar />
          </div>
        )}
        <div style={{ flex: '1 1 auto', maxWidth: '650px', width: '100%' }}>
          {children}
        </div>
        {screen === 'desktop' && (
          <div style={{ position: 'sticky', top: '60px', flexShrink: 0 }}>
            <AdsterraSidebar />
          </div>
        )}
      </div>
      {screen === 'tablet' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <AdsterraBanner300x250 />
        </div>
      )}
    </>
  );
}
