'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './LeaderboardTable.module.css';
import { fetchTop, loadSubmission } from '@/lib/leaderboard';
import { useTranslations } from '@/hooks/useTranslations';

export default function LeaderboardTable() {
  const { t, currentLocale } = useTranslations();
  const lb = t?.lb || {};
  const prefix = currentLocale === 'en' ? '' : `/${currentLocale}`;
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const mine = typeof window !== 'undefined' ? loadSubmission() : null;

  useEffect(() => {
    let alive = true;
    setData(null);
    setError(false);
    fetchTop(period)
      .then(d => { if (alive) setData(d); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [period]);

  const modeLabel = (m) => (lb.modes && lb.modes[m]) || m;
  const styleLabel = (s) => (s && lb.styles && lb.styles[s]) || '';

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${period === 'today' ? styles.tabActive : ''}`}
          onClick={() => setPeriod('today')}
        >
          {lb.today || 'Today'}
        </button>
        <button
          className={`${styles.tab} ${period === 'week' ? styles.tabActive : ''}`}
          onClick={() => setPeriod('week')}
        >
          {lb.weekly || 'This Week'}
        </button>
        <button
          className={`${styles.tab} ${period === 'all' ? styles.tabActive : ''}`}
          onClick={() => setPeriod('all')}
        >
          {lb.allTime || 'All-Time'}
        </button>
      </div>

      {error && (
        <p className={styles.note}>{lb.offline || 'Leaderboard is taking a breather — try again in a minute.'}</p>
      )}
      {!data && !error && <p className={styles.note}>{lb.loading || 'Loading…'}</p>}

      {data && data.entries.length === 0 && (
        <p className={styles.note}>{lb.empty || 'No entries yet — be the first to submit a season.'}</p>
      )}

      {data && data.entries.length > 0 && (
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.head}`}>
            <span>#</span>
            <span className={styles.name}>{lb.player || 'GM'}</span>
            <span className={styles.ratingHead}>{lb.rating || 'Team Rating'}</span>
          </div>
          {data.entries.map((e, i) => {
            const record = e.wins === 82 ? '82-0' : `${e.wins}-${e.losses}`;
            const metaBits = [e.star, modeLabel(e.mode), e.style ? styleLabel(e.style) : null].filter(Boolean);
            return (
              <div
                key={e.id}
                className={`${styles.row} ${mine?.id === e.id ? styles.me : ''} ${i < 3 ? styles.podium : ''}`}
              >
                <span className={styles.rank}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>
                <span className={styles.nameCol}>
                  <span className={styles.name}>
                    {e.name}
                    {mine?.id === e.id && <i className={styles.youTag}>{lb.you || 'You'}</i>}
                  </span>
                  <span className={styles.metaLine}>
                    <b className={styles.recordBit}>
                      {record}{e.wins === 82 && <i className={styles.perfectTag}>★</i>}
                    </b>
                    <span className={styles.gradeBit}>{e.grade}</span>
                    {metaBits.length > 0 && <span className={styles.metaRest}> · {metaBits.join(' · ')}</span>}
                  </span>
                </span>
                <span className={styles.ratingCell}>
                  {e.points}<i>{lb.ratingUnit || 'RTG'}</i>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className={styles.cta}>
        <Link href={`${prefix}/#game`}>{lb.cta || 'Build your starting five and claim a spot →'}</Link>
      </p>
    </div>
  );
}
