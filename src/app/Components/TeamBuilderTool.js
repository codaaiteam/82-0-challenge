'use client';

import { useMemo, useState } from 'react';
import {
  PLAYERS, PLAYSTYLE_IDS, buildSlots, simulateSeason, DECADES, ALL_TEAMS,
} from '@/lib/engine';
import styles from './TeamBuilderTool.module.css';

const POOL_LIMIT = 48;

const fmt = (msg, vars) =>
  Object.entries(vars || {}).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), msg || '');

// Free-pick sandbox: browse all 420 legends, build any five, simulate the
// season. Unlike the spin game there is no randomness in the draft — and no
// leaderboard submission, so the competitive modes stay balanced.
export default function TeamBuilderTool({ t }) {
  const tb = t.tb;
  const g = t.game;

  const [styleId, setStyleId] = useState('balanced');
  const [slots, setSlots] = useState(() => buildSlots('balanced'));
  const [sel, setSel] = useState(0);
  const [query, setQuery] = useState('');
  const [decade, setDecade] = useState('all');
  const [team, setTeam] = useState('all');
  const [result, setResult] = useState(null);

  const pickedIds = slots.filter(s => s.player).map(s => s.player.id);
  // One card per human: a picked player's OTHER era cards leave the pool too,
  // so the five can't stack two Jordans from different decades.
  const pickedNames = new Set(slots.filter(s => s.player).map(s => s.player.name));
  const selSlot = slots.find(s => s.id === sel) || null;
  const full = slots.every(s => s.player);

  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLAYERS
      .filter(p => !pickedIds.includes(p.id) && !pickedNames.has(p.name))
      .filter(p => !selSlot || p.positions.includes(selSlot.pos))
      .filter(p => decade === 'all' || p.decade === decade)
      .filter(p => team === 'all' || p.team === team)
      .filter(p => !q || p.name.toLowerCase().includes(q))
      .sort((a, b) => b.pts - a.pts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, decade, team, sel, slots]);

  const changeStyle = (id) => {
    setStyleId(id);
    setSlots(buildSlots(id));
    setSel(0);
    setResult(null);
  };

  const clickSlot = (slot) => {
    if (slot.player) {
      // Remove the player and make this the active slot to refill.
      setSlots(prev => prev.map(s => (s.id === slot.id ? { ...s, player: null } : s)));
      setResult(null);
    }
    setSel(slot.id);
  };

  const pickPlayer = (p) => {
    if (!selSlot) return;
    const next = slots.map(s => (s.id === selSlot.id ? { ...s, player: p } : s));
    setSlots(next);
    setResult(null);
    const empty = next.find(s => !s.player);
    setSel(empty ? empty.id : -1);
  };

  const clearTeam = () => {
    setSlots(buildSlots(styleId));
    setSel(0);
    setResult(null);
  };

  const simulate = () => {
    if (!full) return;
    setResult(simulateSeason(slots.map(s => s.player)));
  };

  const shown = pool.slice(0, POOL_LIMIT);

  return (
    <div className={styles.tool}>
      {/* Playstyle */}
      <div className={styles.styleRow}>
        <span className={styles.rowLabel}>{g.styles ? g.chooseStyle : 'Playstyle'}</span>
        <div className={styles.styleBtns}>
          {PLAYSTYLE_IDS.map(id => (
            <button
              key={id}
              className={`${styles.styleBtn} ${styleId === id ? styles.active : ''}`}
              onClick={() => changeStyle(id)}
            >
              {g.styles?.[id]?.name || id}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.columns}>
        {/* Your five */}
        <div className={styles.fivePanel}>
          <h3 className={styles.panelTitle}>{tb.yourFive}</h3>
          <div className={styles.slotList}>
            {slots.map(slot => (
              <button
                key={slot.id}
                className={`${styles.slot} ${sel === slot.id ? styles.slotActive : ''} ${slot.player ? styles.slotFilled : ''}`}
                onClick={() => clickSlot(slot)}
                title={slot.player ? tb.remove : undefined}
              >
                <span className={styles.slotPos}>{slot.pos}</span>
                {slot.player ? (
                  <span className={styles.slotPlayer}>
                    <span className={styles.slotName}>{slot.player.name}</span>
                    <span className={styles.slotMeta}>
                      {slot.player.team} · {slot.player.decade} · {slot.player.pts} {g.ppg}
                    </span>
                  </span>
                ) : (
                  <span className={styles.slotEmpty}>{tb.emptySlot}</span>
                )}
                {slot.player && <span className={styles.slotX}>×</span>}
              </button>
            ))}
          </div>

          <button className={styles.simBtn} onClick={simulate} disabled={!full}>
            {result ? tb.resim : tb.simulate}
          </button>
          {pickedIds.length > 0 && (
            <button className={styles.clearBtn} onClick={clearTeam}>{tb.clear}</button>
          )}
          <p className={styles.sandboxNote}>{tb.sandboxNote}</p>

          {/* Result */}
          {result && (
            <div className={styles.result}>
              <div className={styles.record}>{result.wins}W – {result.losses}L</div>
              <div className={styles.titleLine}>
                {g.titles?.[result.title]} · {result.grade} · {result.points} {g.pts}
              </div>
              <div className={styles.totals}>
                <span className={styles.totalsLabel}>{tb.teamTotals}</span>
                {[['pts', g.ppg], ['reb', g.rpg], ['ast', g.apg], ['stl', g.spg], ['blk', g.bpg]].map(([c, label]) => (
                  <span key={c} className={styles.totalStat}>
                    <b>{result.rawTotals[c].toFixed(1)}</b> {label}
                  </span>
                ))}
              </div>
              <div className={styles.resultRow}>
                <span>{g.bestPick}: <b>{result.best.name}</b></span>
                <span>{g.weakness}: {g.weaknesses?.[result.weakness]}</span>
              </div>
            </div>
          )}
        </div>

        {/* Player pool */}
        <div className={styles.poolPanel}>
          <h3 className={styles.panelTitle}>
            {full && sel === -1 ? tb.teamComplete : fmt(tb.pickFor, { pos: selSlot?.pos || '' })}
          </h3>
          <div className={styles.filters}>
            <input
              className={styles.search}
              type="search"
              placeholder={fmt(tb.searchPlaceholder, { total: PLAYERS.length })}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <select className={styles.select} value={decade} onChange={e => setDecade(e.target.value)}>
              <option value="all">{tb.allDecades}</option>
              {DECADES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className={styles.select} value={team} onChange={e => setTeam(e.target.value)}>
              <option value="all">{tb.allTeams}</option>
              {[...ALL_TEAMS].sort().map(tm => <option key={tm} value={tm}>{tm}</option>)}
            </select>
          </div>

          <div className={styles.poolList}>
            {shown.map(p => (
              <button key={p.id} className={styles.playerCard} onClick={() => pickPlayer(p)} disabled={!selSlot}>
                <span className={styles.playerTop}>
                  <span className={styles.playerName}>{p.name}</span>
                  <span className={styles.playerMeta}>{p.team} · {p.decade} · {p.positions.join('/')}</span>
                </span>
                <span className={styles.playerStats}>
                  {p.pts} {g.ppg} · {p.reb} {g.rpg} · {p.ast} {g.apg} · {p.stl} {g.spg} · {p.blk} {g.bpg}
                </span>
              </button>
            ))}
            {shown.length === 0 && <p className={styles.noMatch}>{tb.noMatches}</p>}
          </div>
          {pool.length > POOL_LIMIT && (
            <p className={styles.moreNote}>{fmt(tb.showingOf, { shown: POOL_LIMIT, total: pool.length })}</p>
          )}
        </div>
      </div>
    </div>
  );
}
