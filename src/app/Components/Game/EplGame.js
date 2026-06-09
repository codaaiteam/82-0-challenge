'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Game.module.css';
import {
  EPL_SLOTS, EPL_ERAS, EPL_CLUBS, eplSlotAccepts, eplSlotLabel,
  eplPlayersFor, eplSpinCombo, eplRerollTeam, eplRerollEra, eplSimulateSeason, eplRandomPick,
} from '@/lib/eplEngine';
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

const ERA_SHORT = { '1990s': "90's", '2000s': "00's", '2010s': "10's", '2020s': "20's" };

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const emptySlots = () => Object.fromEntries(EPL_SLOTS.map(s => [s, null]));

// Pitch rows for the 4-4-2 display, attack at the top.
const ROWS = [['FW1', 'FW2'], ['MF1', 'MF2', 'MF3', 'MF4'], ['DF1', 'DF2', 'DF3', 'DF4'], ['GK']];

export default function EplGame({ t }) {
  const g = t?.game || {};
  const e = g.epl || {};

  const [mode, setMode] = useState(null);
  const [phase, setPhase] = useState('spin');
  const [slots, setSlots] = useState(emptySlots);
  const [combo, setCombo] = useState(null);
  const [display, setDisplay] = useState({ team: '???', era: "??'s" });
  const [selected, setSelected] = useState(null);
  const [posFilter, setPosFilter] = useState('All');
  const [teamSkips, setTeamSkips] = useState(1);
  const [eraSkips, setEraSkips] = useState(1);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const spinTimer = useRef(null);

  const lineup = Object.values(slots).filter(Boolean);
  const pickedIds = lineup.map(p => p.id);
  const openSlots = EPL_SLOTS.filter(s => !slots[s]);
  const round = lineup.length + 1;
  const totalRounds = EPL_SLOTS.length;

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
        setPosFilter('All');
        setPhase('pick');
      } else {
        setDisplay({
          team: eplRandomPick(EPL_CLUBS),
          era: ERA_SHORT[eplRandomPick(EPL_ERAS)],
        });
      }
    }, SPIN_TICK);
  }, []);

  const handleSpin = () => animateTo(eplSpinCombo(pickedIds, openSlots));

  const handleTeamSkip = () => {
    if (teamSkips <= 0 || phase !== 'pick') return;
    setTeamSkips(teamSkips - 1);
    animateTo(eplRerollTeam(combo, pickedIds, openSlots));
  };

  const handleEraSkip = () => {
    if (eraSkips <= 0 || phase !== 'pick') return;
    setEraSkips(eraSkips - 1);
    animateTo(eplRerollEra(combo, pickedIds, openSlots));
  };

  const candidates = combo ? eplPlayersFor(combo.team, combo.era, pickedIds) : [];
  const shown = candidates
    .filter(p => posFilter === 'All' || p.pos === posFilter)
    .sort((a, b) => b.rating - a.rating);

  const canPlace = (p) => openSlots.some(s => eplSlotAccepts(s, p.pos));

  const handlePlace = (slot) => {
    if (!selected || slots[slot] || !eplSlotAccepts(slot, selected.pos)) return;
    const newSlots = { ...slots, [slot]: selected };
    setSelected(null);
    setSlots(newSlots);
    if (Object.values(newSlots).every(Boolean)) {
      setResult(eplSimulateSeason(newSlots));
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
    ? fmt(e.shareText || g.shareText, { record: `${result.wins}-${result.losses}` })
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${SITE_URL}/38-0`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(SITE_URL + '/38-0')}`;

  const handlePoster = () => {
    if (!result) return;
    downloadPoster({
      brand: '38-0 CHALLENGE',
      record: `${result.wins}-${result.losses}`,
      grade: result.grade,
      title: e.titles?.[result.title] || g.titles?.[result.title] || '',
      points: result.points,
      lineup: EPL_SLOTS.map(s => ({
        pos: eplSlotLabel(s),
        name: slots[s].name,
        sub: `${slots[s].club} · ${slots[s].era}`,
      })),
      url: 'www.82-0-challenge.com/38-0',
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
            <span className={styles.gradeTitle}>{e.titles?.[result.title] || g.titles?.[result.title]}</span>
            <span className={styles.gradePts}>· {result.points} {g.pts}</span>
          </div>

          <div className={styles.resultStats}>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>{g.bestPick}</span>
              <span className={styles.resultStatValue}>{result.best.name}</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>{g.weakness}</span>
              <span className={styles.resultStatValue}>{e.weaknesses?.[result.weakness]}</span>
            </div>
          </div>

          <div className={styles.lineupRecap}>
            {EPL_SLOTS.map(slot => (
              <div key={slot} className={styles.recapRow}>
                <span className={styles.recapChip}>
                  <b>{initials(slots[slot].name)}</b>
                  <i>{eplSlotLabel(slot)}</i>
                </span>
                <span className={styles.recapName}>
                  {slots[slot].name}
                  <small>{slots[slot].club} · {slots[slot].era}</small>
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
                {['All', 'GK', 'DF', 'MF', 'FW'].map(f => (
                  <button
                    key={f}
                    className={`${styles.filterChip} ${posFilter === f ? styles.filterActive : ''}`}
                    onClick={() => setPosFilter(f)}
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
                        <small>{p.club} · {p.era}</small>
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

        {/* 4-4-2 pitch */}
        <div className={styles.courtPanel}>
          <div className={styles.pitch}>
            <svg className={styles.pitchLines} viewBox="0 0 100 120" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
              {/* sidelines */}
              <rect x="2" y="2" width="96" height="116" rx="2" />
              {/* halfway line + center circle (top = attacking end) */}
              <line x1="2" y1="2" x2="98" y2="2" />
              <path d="M35 2 A15 15 0 0 0 65 2" />
              {/* penalty box + six-yard box (bottom = own goal) */}
              <rect x="22" y="82" width="56" height="36" />
              <rect x="37" y="104" width="26" height="14" />
              {/* penalty arc */}
              <path d="M40 82 A12 12 0 0 1 60 82" />
              {/* spots + goal */}
              <circle className={styles.pitchSpot} cx="50" cy="100" r="0.9" />
              <circle className={styles.pitchSpot} cx="50" cy="2" r="0.9" />
              <line className={styles.goal} x1="43" y1="118" x2="57" y2="118" />
            </svg>
            {ROWS.map((row, i) => (
              <div key={i} className={styles.pitchRow}>
                {row.map(slot => {
                  const p = slots[slot];
                  const eligible = selected && !p && eplSlotAccepts(slot, selected.pos);
                  return (
                    <button
                      key={slot}
                      className={`${styles.formSlot} ${styles.pitchSlot} ${p ? styles.slotFilled : ''} ${eligible ? styles.slotEligible : ''}`}
                      onClick={() => handlePlace(slot)}
                    >
                      {p ? (
                        <>
                          <b>{initials(p.name)}</b>
                          <i>{eplSlotLabel(slot)}</i>
                        </>
                      ) : (
                        <span>{eplSlotLabel(slot)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
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
