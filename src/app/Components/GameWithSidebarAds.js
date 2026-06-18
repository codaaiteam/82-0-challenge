'use client';

import { useEffect, useState } from 'react';
import AdsterraSidebar from './AdsterraSidebar';
import AdsterraBanner300x250 from './AdsterraBanner300x250';

// How many 160px side ad columns can fit WITHOUT squeezing the 760px game.
//   2 columns: 160 + 28 + 760 + 28 + 160 + 32(pad) ≈ 1168px → need ≥1180
//   1 column:  160 + 28 + 760 + 32(pad)            ≈ 980px  → need ≥980
//   0 columns: game only (centered), 300×250 banner drops in below
// Below each threshold we drop an ad rather than narrow the game.
export default function GameWithSidebarAds({ children }) {
  const [sides, setSides] = useState(0);

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w >= 1180) setSides(2);
      else if (w >= 980) setSides(1);
      else setSides(0);
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
        gap: '1.75rem',
        width: '100%',
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '0 1rem',
      }}>
        {sides >= 1 && (
          <div style={{ position: 'sticky', top: '60px', flexShrink: 0 }}>
            <AdsterraSidebar />
          </div>
        )}
        <div style={{ flex: '1 1 auto', maxWidth: '760px', width: '100%' }}>
          {children}
        </div>
        {sides >= 2 && (
          <div style={{ position: 'sticky', top: '60px', flexShrink: 0 }}>
            <AdsterraSidebar />
          </div>
        )}
      </div>
      {/* When neither side column fits (mobile, tablet, narrow desktop) the game
          still gets one clean 300×250 display banner below it — replaces the
          removed native banner that triggered deceptive "security alert" prompts. */}
      {sides === 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          <AdsterraBanner300x250 />
        </div>
      )}
    </>
  );
}
