'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';

const KEY = 'cookie-notice-820';

// Lightweight cookie/ads disclosure banner. Choice stored in localStorage.
export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch { /* storage blocked — stay hidden */ }
  }, []);

  const choose = (value) => {
    try { localStorage.setItem(KEY, value); } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(10, 14, 26, 0.97)', borderTop: '1px solid #2c313d',
      padding: '0.8rem 1rem', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap',
      fontSize: '0.82rem', color: '#b6c2da',
    }}>
      <span>
        We use cookies from advertising partners to support this free site.{' '}
        <Link href="/privacy" style={{ color: '#f2641e' }}>Learn more</Link>
      </span>
      <span style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => choose('accepted')}
          style={{
            background: 'linear-gradient(135deg, #f2641e, #c24e12)', color: '#fff',
            border: 'none', borderRadius: 8, padding: '0.45rem 1rem',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem',
          }}
        >
          OK
        </button>
        <button
          onClick={() => choose('declined')}
          style={{
            background: 'transparent', color: '#b6c2da',
            border: '1px solid #3b414e', borderRadius: 8, padding: '0.45rem 1rem',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem',
          }}
        >
          Decline
        </button>
      </span>
    </div>
  );
}
