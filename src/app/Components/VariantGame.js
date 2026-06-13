'use client'

import { useState } from 'react';
import GameMain from './Game/GameMain';
import styles from './Game/Game.module.css';
import { FILTERS, FRANCHISE_TEAMS, DECADES } from '@/lib/engine';

// A single Challenge variant on its own page. No-param variants (No MVPs, Hard
// Mode) drop straight into the game; One Franchise / One Decade show a compact
// picker and remount the game when the choice changes.
export default function VariantGame({ t, id }) {
  const cfg = FILTERS[id];
  const fp = t?.pages?.filter || {};
  const needsTeam = cfg?.param === 'team';
  const needsDecade = cfg?.param === 'decade';
  const [team, setTeam] = useState(FRANCHISE_TEAMS[0]);
  const [decade, setDecade] = useState('1990s');
  const param = needsTeam ? team : needsDecade ? decade : null;

  return (
    <>
      {(needsTeam || needsDecade) && (
        <div className={styles.variantPickerBar}>
          <span className={styles.variantPickerLabel}>
            {needsTeam ? (fp.chooseTeam || 'Franchise') : (fp.chooseDecade || 'Decade')}
          </span>
          <select
            className={styles.filterSelect}
            value={param}
            onChange={e => (needsTeam ? setTeam(e.target.value) : setDecade(e.target.value))}
          >
            {(needsTeam ? FRANCHISE_TEAMS : DECADES).map(o => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      )}
      {/* Remount on param change so switching team/decade starts a clean draft. */}
      <GameMain key={param || id} t={t} variant={{ id, param }} />
    </>
  );
}
