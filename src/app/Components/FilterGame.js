'use client'

import { useState } from 'react';
import GameMain from './Game/GameMain';
import styles from './Game/Game.module.css';
import { FRANCHISE_TEAMS, DECADES, randomPick } from '@/lib/engine';

// Order the filter cards are shown in. 'classic' anchors the list as the
// baseline; the rest are the differentiated "better 82-0" modes.
const FILTER_ORDER = ['cap', 'noMvps', 'oneFranchise', 'oneDecade', 'randomEra', 'hard', 'classic'];

// Difficulty colour per filter (label text comes from the locale).
const DIFF_CLASS = {
  classic: 'diffEasy', cap: 'diffHard', noMvps: 'diffMed',
  oneFranchise: 'diffMed', oneDecade: 'diffMed', randomEra: 'diffMed', hard: 'diffHard',
};

export default function FilterGame({ t }) {
  const cap = t?.game?.cap || {};
  const fp = t?.pages?.filter || {};
  const filters = fp.filters || {};
  const [variant, setVariant] = useState(null);     // { id, param }
  const [team, setTeam] = useState(FRANCHISE_TEAMS[0]);
  const [decade, setDecade] = useState('1990s');

  if (variant) {
    return (
      <div className={styles.game}>
        <button className={styles.filterBack} onClick={() => setVariant(null)}>
          ← {fp.changeFilter || 'Change filter'}
        </button>
        <GameMain t={t} variant={variant} />
      </div>
    );
  }

  const play = (id, param = null) => setVariant({ id, param });

  return (
    <div className={styles.game}>
      <div className={styles.filterGrid}>
        {FILTER_ORDER.map(id => {
          const f = filters[id] || {};
          return (
            <div key={id} className={styles.filterCard}>
              <div className={styles.filterCardHead}>
                <span className={styles.filterCardName}>{cap.variants?.[id] || id}</span>
                {f.diff && <span className={`${styles.filterDiff} ${styles[DIFF_CLASS[id]]}`}>{f.diff}</span>}
              </div>
              <p className={styles.filterCardDesc}>{f.desc}</p>

              {id === 'oneFranchise' ? (
                <div className={styles.filterPicker}>
                  <select className={styles.filterSelect} value={team} onChange={e => setTeam(e.target.value)}>
                    {FRANCHISE_TEAMS.map(tm => <option key={tm} value={tm}>{tm}</option>)}
                  </select>
                  <button className={styles.filterPlay} onClick={() => play('oneFranchise', team)}>
                    {fp.play || 'Play'}
                  </button>
                </div>
              ) : id === 'oneDecade' ? (
                <div className={styles.filterPicker}>
                  <select className={styles.filterSelect} value={decade} onChange={e => setDecade(e.target.value)}>
                    {DECADES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button className={styles.filterPlay} onClick={() => play('oneDecade', decade)}>
                    {fp.play || 'Play'}
                  </button>
                </div>
              ) : (
                <button
                  className={styles.filterPlay}
                  onClick={() => play(id, id === 'randomEra' ? randomPick(DECADES) : null)}
                >
                  {fp.play || 'Play'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
