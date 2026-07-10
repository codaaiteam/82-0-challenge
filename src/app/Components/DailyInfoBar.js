'use client';

import { useEffect, useState } from 'react';
import { msToNextUtcMidnight } from '@/lib/seeded';
import styles from './DailyInfoBar.module.css';

// Daily Challenge #1 was 2026-06-06 (UTC) — the day the mode shipped.
const EPOCH_UTC = Date.UTC(2026, 5, 6);

const fmt = (msg, vars) =>
  Object.entries(vars || {}).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), msg || '');

// Challenge number, UTC date and next-draw countdown. All derived from the
// same UTC clock that seeds the draw, so it needs no backend. Rendered only
// after mount — the server can't know the visitor's current time.
export default function DailyInfoBar({ t }) {
  const d = t.pages?.daily || {};
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  if (!now) return <div className={styles.bar} aria-hidden="true" />;

  const num = Math.floor((now - EPOCH_UTC) / 86400000) + 1;
  const dateStr = new Date(now).toISOString().slice(0, 10);
  const ms = msToNextUtcMidnight();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);

  return (
    <div className={styles.bar}>
      <span className={styles.num}>{fmt(d.challengeNo, { n: num })}</span>
      <span className={styles.date}>{dateStr} UTC</span>
      <span className={styles.badge}>{d.sameDraw}</span>
      <span className={styles.countdown}>
        {fmt(d.nextIn, { time: `${h}h ${String(m).padStart(2, '0')}m` })}
      </span>
    </div>
  );
}
