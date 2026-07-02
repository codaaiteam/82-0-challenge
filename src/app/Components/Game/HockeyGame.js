'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Game.module.css';
import {
  NHL_SLOTS, NHL_ERAS, NHL_TEAMS, nhlSlotAccepts,
  nhlPlayersFor, nhlSpinCombo, nhlRerollTeam, nhlRerollEra, nhlSimulateSeason, nhlRandomPick,
} from '@/lib/nhlEngine';
import { downloadPoster } from '@/lib/poster';

const SITE_URL = 'https://www.82-0-challenge.com';
const SPIN_MS = 1400;
const SPIN_TICK = 70;

function fmt(template, vars) {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, v),
    template || ''
  );
}

const ERA_SHORT = {
  '1980s': "80's", '1990s': "90's", '2000s': "00's", '2010s': "10's", '2020s': "20's",
};

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const emptySlots = () => Object.fromEntries(NHL_SLOTS.map(s => [s, null]));

export default function HockeyGame({ t }) {
  const g = t?.game || {};
  const n = g.nhl || {};

  const [mode, setMode] = useState(null);
  const [phase, setPhase] = useState('spin'); // spin | spinning | pick | result
  const [slots, setSlots] = useState(emptySlots);
  const [combo, setCombo] = useState(null);
  const [display, setDisplay] = useState({ team: '???', era: "??'s" });
  const [selected, setSelected] = useState(null);
  const [sideFilter, setSideFilter] = useState('All');
  const [teamSkips, setTeamSkips] = useState(1);
  const [eraSkips, setEraSkips] = useState(1);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const spinTimer = useRef(null);

  const lineup = Object.values(slots).filter(Boolean);
  const pickedIds = lineup.map(p => p.id);
  const openSlots = NHL_SLOTS.filter(s => !slots[s]);
  const round = lineup.length + 1;
  const totalRounds = NHL_SLOTS.length;

  useEffect(() => () => clearInterval(spinTimer.current), []);

  const animateTo = useCallback((target) => {
    setPhase('spinning');
    clearInterval(spinTimer.current);
    const start = Date.now();
    spinTimer.current = setInterval(() => {
      if (Date.now() - start >= SPIN_MS) {
        clearInterval(spinTimer.current);
        setDisplay({ team: target.team, era: ERA_SHORT[target.era] });
        setCombo(target);
        setSelected(null);
        setSideFilter('All');
        setPhase('pick');
      } else {
        setDisplay({
          team: nhlRandomPick(NHL_TEAMS),
          era: ERA_SHORT[nhlRandomPick(NHL_ERAS)],
        });
      }
    }, SPIN_TICK);
  }, []);

  const handleSpin = () => animateTo(nhlSpinCombo(pickedIds, openSlots));

  const handleTeamSkip = () => {
    if (teamSkips <= 0 || phase !== 'pick') return;
    setTeamSkips(teamSkips - 1);
    animateTo(nhlRerollTeam(combo, pickedIds, openSlots));
  };

  const handleEraSkip = () => {
    if (eraSkips <= 0 || phase !== 'pick') return;
    setEraSkips(eraSkips - 1);
    animateTo(nhlRerollEra(combo, pickedIds, openSlots));
  };

  const candidates = combo ? nhlPlayersFor(combo.team, combo.era, pickedIds) : [];
  const FWD = ['C', 'LW', 'RW'];
  const shown = candidates
    .filter(p => {
      if (sideFilter === 'All') return true;
      if (sideFilter === 'FWD') return FWD.includes(p.pos);
      return !FWD.includes(p.pos); // D + G
    })
    .sort((a, b) => b.rating - a.rating);

  const canPlace = (p) => openSlots.some(s => nhlSlotAccepts(s, p.pos));

  const handlePlace = (slot) => {
    if (!selected || slots[slot] || !nhlSlotAccepts(slot, selected.pos)) return;
    const newSlots = { ...slots, [slot]: selected };
    setSelected(null);
    setSlots(newSlots);
    if (Object.values(newSlots).every(Boolean)) {
      setResult(nhlSimulateSeason(newSlots));
      setPhase('result');
    } else {
      setCombo(null);
      setPhase('spin');
    }
  };

  const handleRestart = () => {
    setPhase('spin');
    setSlots(emptySlots());
    setCombo(null);
    setSelected(null);
    setTeamSkips(1);
    setEraSkips(1);
    setResult(null);
    setCopied(false);
    setDisplay({ team: '???', era: "??'s" });
  };

  const backToModes = () => { handleRestart(); setMode(null); };

  const shareText = result
    ? fmt(n.shareText, { record: `${result.wins}-${result.losses}` })
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${SITE_URL}/82-0-nhl`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(SITE_URL + '/82-0-nhl')}`;

  const handlePoster = () => {
    if (!result) return;
    downloadPoster({
      brand: '82-0 NHL CHALLENGE',
      record: `${result.wins}-${result.losses}`,
      grade: result.grade,
      title: n.titles?.[result.title] || g.titles?.[result.title] || '',
      points: result.points,
      lineup: NHL_SLOTS.map(s => ({
        pos: s,
        name: slots[s].name,
        sub: `${slots[s].team} · ${slots[s].era}`,
      })),
      url: 'www.82-0-challenge.com/82-0-nhl',
      daily: null,
    });
  };

  // ===== MODE SELECT =====
  if (!mode) {
    return (
      <div className={styles.game}>
        <div className={styles.modeSelect}>
          <h2 className={styles.modeTitle}>{g.chooseMode}</h2>
          <p className={styles.modeSubtitle}>{g.chooseModeSub}</p>
          <div className={styles.modeGrid}>
            <div className={styles.modeCard}>
              <div className={styles.modeName}>💯 {g.modeClassic}</div>
              <p className={styles.modeDesc}>{g.modeClassicDesc}</p>
              <button className={styles.primaryBtn} onClick={() => setMode('classic')}>
                {g.playClassic}
              </button>
            </div>
            <div className={styles.modeCard}>
              <div className={styles.modeName}>🧠 {g.modeHoopiq}</div>
              <p className={styles.modeDesc}>{g.modeHoopiqDesc}</p>
              <button className={styles.primaryBtn} onClick={() => setMode('hoopiq')}>
                {g.playHoopiq}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== RESULT =====
  if (phase === 'result' && result) {
    return (
      <div className={styles.game}>
        <div className={styles.resultCard}>
          <div className={styles.modeBadge}>
            {mode === 'classic' ? g.modeClassic : g.modeHoopiq}
          </div>
          <div className={styles.resultLabel}>{g.projectedRecord}</div>
          <div className={styles.resultRecord}>{result.wins}–{result.losses}</div>
          <div className={styles.gradeRow}>
            <span className={styles.gradeBadge}>{result.grade}</span>
            <span className={styles.gradeTitle}>{n.titles?.[result.title] || g.titles?.[result.title]}</span>
            <span className={styles.gradePts}>· {result.points} {g.pts}</span>
          </div>

          <div className={styles.resultStats}>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>{g.bestPick}</span>
              <span className={styles.resultStatValue}>{result.best.name}</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>{g.weakness}</span>
              <span className={styles.resultStatValue}>{n.weaknesses?.[result.weakness]}</span>
            </div>
          </div>

          <div className={styles.lineupRecap}>
            {NHL_SLOTS.map(slot => (
              <div key={slot} className={styles.recapRow}>
                <span className={styles.recapChip}>
                  <b>{initials(slots[slot].name)}</b>
                  <i>{slot}</i>
                </span>
                <span className={styles.recapName}>
                  {slots[slot].name}
                  <small>{slots[slot].team} · {slots[slot].era}</small>
                </span>
                <span className={styles.recapStats}>
                  <span>{slots[slot].rating}<i>OVR</i></span>
                </span>
              </div>
            ))}
          </div>

          <div className={styles.resultActions}>
            <button className={styles.primaryBtn} onClick={handleRestart}>{g.playAgain}</button>
            <button className={styles.secondaryBtn} onClick={handlePoster}>
              {g.poster || 'Download Poster'}
            </button>
            <button className={styles.secondaryBtn} onClick={handleCopy}>
              {copied ? g.copied : g.copyResult}
            </button>
            <a className={styles.secondaryBtn} href={xShareUrl} target="_blank" rel="noopener noreferrer">
              {g.shareOnX}
            </a>
            <button className={styles.secondaryBtn} onClick={backToModes}>{g.switchMode}</button>
          </div>
        </div>
      </div>
    );
  }

  // ===== DRAFT =====
  return (
    <div className={styles.game}>
      <div className={styles.draftHeader}>
        <span className={styles.roundBadge}>{fmt(g.roundOf, { round, total: totalRounds })}</span>
        {phase === 'pick' && (
          <div className={styles.skips}>
            <button className={styles.skipBtn} onClick={handleTeamSkip} disabled={teamSkips <= 0}>
              🔁 {g.rerollTeam} ({teamSkips})
            </button>
            <button className={styles.skipBtn} onClick={handleEraSkip} disabled={eraSkips <= 0}>
              🔁 {g.rerollEra} ({eraSkips})
            </button>
          </div>
        )}
      </div>

      <div className={styles.slotMachine}>
        <div className={`${styles.slotWindow} ${styles.slotTeam} ${phase === 'spinning' ? styles.slotSpinning : ''}`}>
          <span className={styles.slotLabel}>{g.team}</span>
          <span className={styles.slotValue}>{display.team}</span>
        </div>
        <div className={`${styles.slotWindow} ${styles.slotEra} ${phase === 'spinning' ? styles.slotSpinning : ''}`}>
          <span className={styles.slotLabel}>{g.era}</span>
          <span className={styles.slotValue}>{display.era}</span>
        </div>
        {(phase === 'spin' || phase === 'spinning') && (
          <button className={styles.spinBtn} onClick={handleSpin} disabled={phase === 'spinning'}>
            {phase === 'spinning' ? g.spinning : g.spin}
          </button>
        )}
      </div>

      <div className={styles.draftBody}>
        <div className={styles.playerPanel}>
          {phase === 'pick' ? (
            <>
              <div className={styles.listToolbar}>
                {['All', 'FWD', 'DEF'].map(f => (
                  <button
                    key={f}
                    className={`${styles.filterChip} ${sideFilter === f ? styles.filterActive : ''}`}
                    onClick={() => setSideFilter(f)}
                  >
                    {f === 'All' ? g.filterAll : f}
                  </button>
                ))}
                <span className={styles.countLabel}>
                  {fmt(g.playersAvailable, { count: shown.length })}
                </span>
              </div>
              <div className={styles.playerList}>
                {shown.map(p => {
                  const placeable = canPlace(p);
                  return (
                    <button
                      key={p.id}
                      className={`${styles.playerRow} ${selected?.id === p.id ? styles.playerSelected : ''} ${!placeable ? styles.playerBlocked : ''}`}
                      onClick={() => placeable && setSelected(p)}
                      disabled={!placeable}
                    >
                      <span className={styles.playerInfo}>
                        <b>{p.name}</b>
                        <span className={styles.playerPos}>{p.pos}</span>
                        <small>{p.team} · {p.era}</small>
                      </span>
                      {mode === 'classic' && (
                        <span className={styles.statLine}>
                          <span>{p.rating}<i>OVR</i></span>
                          <span className={styles.nflStat}>{p.stat1}</span>
                          <span className={styles.nflStat}>{p.stat2}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className={styles.spinHint}>{g.spinHint}</div>
          )}
        </div>

        {/* Lineup grid */}
        <div className={styles.courtPanel}>
          <div className={styles.formation}>
            {NHL_SLOTS.map(slot => {
              const p = slots[slot];
              const eligible = selected && !p && nhlSlotAccepts(slot, selected.pos);
              return (
                <button
                  key={slot}
                  className={`${styles.formSlot} ${p ? styles.slotFilled : ''} ${eligible ? styles.slotEligible : ''}`}
                  onClick={() => handlePlace(slot)}
                >
                  {p ? (
                    <>
                      <b>{initials(p.name)}</b>
                      <i>{slot}</i>
                    </>
                  ) : (
                    <span>{slot}</span>
                  )}
                </button>
              );
            })}
          </div>
          {selected && (
            <div className={styles.placingBar}>
              {fmt(g.placing, { name: selected.name })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
