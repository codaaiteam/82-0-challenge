'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Game.module.css';
import {
  POSITIONS, DECADES, ALL_TEAMS,
  playersFor, spinCombo, rerollTeam, rerollEra, simulateSeason, randomPick,
} from '@/lib/engine';

const TOTAL_ROUNDS = 5;
const SITE_URL = 'https://www.82-0-challenge.com';
const SPIN_MS = 1400;
const SPIN_TICK = 70;

function fmt(template, vars) {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, v),
    template || ''
  );
}

const DECADE_SHORT = {
  '1960s': "60's", '1970s': "70's", '1980s': "80's", '1990s': "90's",
  '2000s': "00's", '2010s': "10's", '2020s': "20's",
};

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function GameMain({ t }) {
  const g = t?.game || {};

  // mode: null (select screen) | 'classic' | 'hoopiq'
  const [mode, setMode] = useState(null);
  // phase: 'spin' | 'spinning' | 'pick' | 'result'
  const [phase, setPhase] = useState('spin');
  const [round, setRound] = useState(1);
  const [slots, setSlots] = useState({ PG: null, SG: null, SF: null, PF: null, C: null });
  const [combo, setCombo] = useState(null);          // settled {team, decade}
  const [display, setDisplay] = useState({ team: '???', decade: "??'s" }); // slot windows
  const [selected, setSelected] = useState(null);     // player awaiting placement
  const [posFilter, setPosFilter] = useState('All');
  const [teamSkips, setTeamSkips] = useState(1);
  const [eraSkips, setEraSkips] = useState(1);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const spinTimer = useRef(null);

  const lineup = Object.values(slots).filter(Boolean);
  const pickedIds = lineup.map(p => p.id);
  const openSlots = POSITIONS.filter(pos => !slots[pos]);

  useEffect(() => () => clearInterval(spinTimer.current), []);

  // ---- slot machine ----
  const animateTo = useCallback((target) => {
    setPhase('spinning');
    clearInterval(spinTimer.current);
    const start = Date.now();
    spinTimer.current = setInterval(() => {
      if (Date.now() - start >= SPIN_MS) {
        clearInterval(spinTimer.current);
        setDisplay({ team: target.team, decade: DECADE_SHORT[target.decade] });
        setCombo(target);
        setSelected(null);
        setPosFilter('All');
        setPhase('pick');
      } else {
        setDisplay({
          team: randomPick(ALL_TEAMS),
          decade: DECADE_SHORT[randomPick(DECADES)],
        });
      }
    }, SPIN_TICK);
  }, []);

  const handleSpin = () => {
    animateTo(spinCombo(pickedIds, openSlots));
  };

  const handleTeamSkip = () => {
    if (teamSkips <= 0 || phase !== 'pick') return;
    setTeamSkips(teamSkips - 1);
    animateTo(rerollTeam(combo, pickedIds, openSlots));
  };

  const handleEraSkip = () => {
    if (eraSkips <= 0 || phase !== 'pick') return;
    setEraSkips(eraSkips - 1);
    animateTo(rerollEra(combo, pickedIds, openSlots));
  };

  // ---- picking & placing ----
  const candidates = combo ? playersFor(combo.team, combo.decade, pickedIds) : [];
  const shown = candidates
    .filter(p => {
      if (posFilter === 'All') return true;
      if (posFilter === 'G') return p.positions.some(x => x === 'PG' || x === 'SG');
      if (posFilter === 'F') return p.positions.some(x => x === 'SF' || x === 'PF');
      return p.positions.includes('C');
    })
    .sort((a, b) => b.pts - a.pts);

  const canPlace = (p) => p.positions.some(pos => openSlots.includes(pos));

  const handlePlace = (pos) => {
    if (!selected || slots[pos] || !selected.positions.includes(pos)) return;
    const newSlots = { ...slots, [pos]: selected };
    setSelected(null);
    setSlots(newSlots);
    const newLineup = Object.values(newSlots).filter(Boolean);
    if (newLineup.length >= TOTAL_ROUNDS) {
      setResult(simulateSeason(newLineup));
      setPhase('result');
    } else {
      setRound(round + 1);
      setCombo(null);
      setPhase('spin');
    }
  };

  const handleRestart = () => {
    setPhase('spin');
    setRound(1);
    setSlots({ PG: null, SG: null, SF: null, PF: null, C: null });
    setCombo(null);
    setSelected(null);
    setTeamSkips(1);
    setEraSkips(1);
    setResult(null);
    setCopied(false);
    setDisplay({ team: '???', decade: "??'s" });
  };

  const backToModes = () => {
    handleRestart();
    setMode(null);
  };

  // ---- share ----
  const shareText = result
    ? fmt(g.shareText, { record: `${result.wins}-${result.losses}` })
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${SITE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(SITE_URL)}`;

  // ================= MODE SELECT =================
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

  // ================= RESULT =================
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
            <span className={styles.gradeTitle}>{g.titles?.[result.title]}</span>
            <span className={styles.gradePts}>· {result.points} {g.pts}</span>
          </div>

          <div className={styles.resultStats}>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>{g.bestPick}</span>
              <span className={styles.resultStatValue}>{result.best.name}</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>{g.weakness}</span>
              <span className={styles.resultStatValue}>{g.weaknesses?.[result.weakness]}</span>
            </div>
          </div>

          <div className={styles.lineupRecap}>
            {POSITIONS.map(pos => slots[pos] && (
              <div key={pos} className={styles.recapRow}>
                <span className={styles.recapChip}>
                  <b>{initials(slots[pos].name)}</b>
                  <i>{pos}</i>
                </span>
                <span className={styles.recapName}>
                  {slots[pos].name}
                  <small>{slots[pos].team} · {slots[pos].decade}</small>
                </span>
                <span className={styles.recapStats}>
                  <span>{slots[pos].pts}<i>{g.ppg}</i></span>
                  <span>{slots[pos].reb}<i>{g.rpg}</i></span>
                  <span>{slots[pos].ast}<i>{g.apg}</i></span>
                  <span>{slots[pos].stl}<i>{g.spg}</i></span>
                  <span>{slots[pos].blk}<i>{g.bpg}</i></span>
                </span>
              </div>
            ))}
          </div>

          <div className={styles.resultActions}>
            <button className={styles.primaryBtn} onClick={handleRestart}>{g.playAgain}</button>
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

  // ================= DRAFT =================
  return (
    <div className={styles.game}>
      <div className={styles.draftHeader}>
        <span className={styles.roundBadge}>{fmt(g.roundOf, { round, total: TOTAL_ROUNDS })}</span>
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

      {/* Slot machine */}
      <div className={styles.slotMachine}>
        <div className={`${styles.slotWindow} ${styles.slotTeam} ${phase === 'spinning' ? styles.slotSpinning : ''}`}>
          <span className={styles.slotLabel}>{g.team}</span>
          <span className={styles.slotValue}>{display.team}</span>
        </div>
        <div className={`${styles.slotWindow} ${styles.slotEra} ${phase === 'spinning' ? styles.slotSpinning : ''}`}>
          <span className={styles.slotLabel}>{g.era}</span>
          <span className={styles.slotValue}>{display.decade}</span>
        </div>
        {(phase === 'spin' || phase === 'spinning') && (
          <button className={styles.spinBtn} onClick={handleSpin} disabled={phase === 'spinning'}>
            {phase === 'spinning' ? g.spinning : g.spin}
          </button>
        )}
      </div>

      <div className={styles.draftBody}>
        {/* Player list */}
        <div className={styles.playerPanel}>
          {phase === 'pick' && (
            <>
              <div className={styles.listToolbar}>
                {['All', 'G', 'F', 'C'].map(f => (
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
                        <span className={styles.playerPos}>{p.positions.join(' · ')}</span>
                        <small>{p.team} · {p.decade}</small>
                      </span>
                      {mode === 'classic' && (
                        <span className={styles.statLine}>
                          <span>{p.pts}<i>{g.ppg}</i></span>
                          <span>{p.reb}<i>{g.rpg}</i></span>
                          <span>{p.ast}<i>{g.apg}</i></span>
                          <span>{p.stl}<i>{g.spg}</i></span>
                          <span>{p.blk}<i>{g.bpg}</i></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {phase !== 'pick' && (
            <div className={styles.spinHint}>{g.spinHint}</div>
          )}
        </div>

        {/* Court */}
        <div className={styles.courtPanel}>
          <div className={styles.court}>
            <div className={styles.courtArc} />
            <div className={styles.courtPaint} />
            {POSITIONS.map(pos => {
              const p = slots[pos];
              const eligible = selected && !p && selected.positions.includes(pos);
              return (
                <button
                  key={pos}
                  className={`${styles.courtSlot} ${styles['slot' + pos]} ${p ? styles.slotFilled : ''} ${eligible ? styles.slotEligible : ''}`}
                  onClick={() => handlePlace(pos)}
                >
                  {p ? (
                    <>
                      <b>{initials(p.name)}</b>
                      <i>{pos}</i>
                    </>
                  ) : (
                    <span>{pos}</span>
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
