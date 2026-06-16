'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from './BaseballGame.module.css';
import { recordRun } from '@/lib/leaderboard';
import {
  buildSlots, aflSlotAccepts,
  AFL_ERAS, AFL_CLUBS, SEASON_GAMES,
  aflPlayersFor, aflSpinCombo, aflReroll, aflSimulateSeason, aflRandomPick,
  aflPreSeasonOdds,
} from '@/lib/baseballEngine';
import { downloadPoster } from '@/lib/poster';

const SITE_URL = 'https://www.82-0-challenge.com/162-0';
const STRUCTURE = 'classic';
const STRUCTURE_LABEL = 'Diamond 9';
const PICKS_PER_SPIN = 2;
const SPIN_MS = 1400;
const SPIN_TICK = 70;
// The live clock ticks every TICK_MS, advancing MIN_PER_TICK game minutes
// across four quarters (0–120); a game rolls over past FULL_TIME (~1s each).
const SIM_TICK_MS = 65;
// 162-game baseball seasons are ~7x longer than the AFL slate this engine was
// built for, so run each game through its clock much faster — the whole reveal
// lands in ~20s (a skip-to-result button covers anyone who'd rather not watch).
const SIM_MIN_PER_TICK = 56;
const SIM_FULL_TIME = 124;
const GAME_MINS = 120;

const DIFFICULTIES = {
  easy:   { rerolls: 3, blind: false },
  normal: { rerolls: 1, blind: false },
  hard:   { rerolls: 0, blind: true },
};

const ERA_SHORT = { '1990s': "90's", '2000s': "00's", '2010s': "10's", '2020s': "20's" };

function fmt(template, vars) {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, v),
    template || ''
  );
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// Baseball scoreline — just the run total (no "behinds").
function scoreline(g) {
  return `${g}`;
}

// Spread n untracked scoring events across the game clock for the live sim.
function spreadMinutes(n) {
  return Array.from({ length: n }, (_, i) => Math.round(((i + 1) * (GAME_MINS - 8)) / (n + 1)));
}

function quarterLabel(minute) {
  // Map the shared game clock (0–120) onto nine baseball innings.
  const inning = Math.min(9, Math.floor(minute / 13.4) + 1);
  return `Inn ${inning}`;
}

export default function BaseballGame({ t }) {
  const g = t?.game || {};
  const e = g.afl || {};

  // ----- setup config -----
  const [phase, setPhase] = useState('setup'); // setup | spin | spinning | pick | complete | simulating | result
  const [difficulty, setDifficulty] = useState('normal');
  const [showRatings, setShowRatings] = useState(true);
  const [draftMode, setDraftMode] = useState('squad'); // squad | position
  const [eraFilter, setEraFilter] = useState(''); // '' = all-time

  // ----- draft state -----
  const [slots, setSlots] = useState([]); // [{id,label,bucket,x,y, player|null}]
  const [combo, setCombo] = useState(null);
  const [comboPicks, setComboPicks] = useState(0); // players taken from current combo
  const [display, setDisplay] = useState({ team: '???', era: "??'s" });
  const [selected, setSelected] = useState(null);      // squad-mode: picked player awaiting placement
  const [targetSlot, setTargetSlot] = useState(null);  // position-mode: slot id we are filling
  const [posFilter, setPosFilter] = useState('All');
  const [rerolls, setRerolls] = useState(1);
  const [result, setResult] = useState(null);
  const [odds, setOdds] = useState(null);
  const [revealed, setRevealed] = useState(0); // rounds fully played out
  const [minute, setMinute] = useState(0);     // live clock of the game being played
  const [copied, setCopied] = useState(false);
  const [pb, setPb] = useState(null);           // { best, runs, isNewBest } — local personal best
  const spinTimer = useRef(null);
  const simTimer = useRef(null);
  const rootRef = useRef(null);
  const mountedRef = useRef(false);

  const blind = DIFFICULTIES[difficulty].blind || !showRatings;
  const filled = slots.filter(s => s.player);
  const pickedIds = filled.map(s => s.player.id);
  const openSlots = slots.filter(s => !s.player);
  const openBuckets = [...new Set(openSlots.map(s => s.bucket))];
  const round = filled.length + 1;
  const totalRounds = slots.length;

  useEffect(() => () => {
    clearInterval(spinTimer.current);
    clearInterval(simTimer.current);
  }, []);

  // Phase changes can shrink the card by hundreds of pixels, dropping the
  // viewport into the SEO content below — keep the game pinned instead.
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    rootRef.current?.scrollIntoView({ block: 'start' });
  }, [phase]);

  // Roll the season out one round at a time, driven by a live game clock.
  // The clock derives from wall time, not tick counts, so browser timer
  // throttling (hidden/occluded tabs) skips ahead instead of stalling.
  useEffect(() => {
    if (phase !== 'simulating') return;
    const start = Date.now();
    simTimer.current = setInterval(() => {
      setMinute(Math.floor((Date.now() - start) / SIM_TICK_MS) * SIM_MIN_PER_TICK);
    }, SIM_TICK_MS);
    return () => clearInterval(simTimer.current);
  }, [phase, revealed]);

  // Final siren — archive the game and bounce the next one.
  useEffect(() => {
    if (phase !== 'simulating' || minute < SIM_FULL_TIME || revealed >= SEASON_GAMES) return;
    setMinute(0);
    setRevealed(r => Math.min(SEASON_GAMES, r + 1));
  }, [phase, minute, revealed]);

  useEffect(() => {
    if (phase !== 'simulating' || revealed < SEASON_GAMES) return;
    clearInterval(simTimer.current);
    const t2 = setTimeout(() => setPhase('result'), 900);
    return () => clearTimeout(t2);
  }, [phase, revealed]);

  // ----- start a configured draft -----
  const startDraft = () => {
    setSlots(buildSlots(STRUCTURE).map(s => ({ ...s, player: null })));
    setRerolls(DIFFICULTIES[difficulty].rerolls);
    setCombo(null);
    setComboPicks(0);
    setSelected(null);
    setTargetSlot(null);
    setResult(null);
    setOdds(null);
    setRevealed(0);
    setCopied(false);
    setPosFilter('All');
    setDisplay({ team: '???', era: "??'s" });
    setPhase('spin');
  };

  // ----- spinning -----
  const animateTo = useCallback((spun) => {
    setPhase('spinning');
    clearInterval(spinTimer.current);
    const start = Date.now();
    spinTimer.current = setInterval(() => {
      if (Date.now() - start >= SPIN_MS) {
        clearInterval(spinTimer.current);
        setDisplay({ team: spun.team, era: ERA_SHORT[spun.era] });
        setCombo(spun);
        setComboPicks(0);
        setSelected(null);
        setPosFilter('All');
        setPhase('pick');
      } else {
        setDisplay({
          team: aflRandomPick(AFL_CLUBS),
          era: ERA_SHORT[aflRandomPick(AFL_ERAS)],
        });
      }
    }, SPIN_TICK);
  }, []);

  const handleSpin = (slotForBucket) => {
    animateTo(aflSpinCombo(pickedIds, openSlots, eraFilter, null, slotForBucket?.bucket));
  };

  const handleReroll = () => {
    if (rerolls <= 0 || phase !== 'pick' || comboPicks > 0) return;
    const mustBucket = targetSlot ? slots.find(s => s.id === targetSlot)?.bucket : null;
    setRerolls(rerolls - 1);
    animateTo(aflReroll(combo, pickedIds, openSlots, eraFilter, mustBucket));
  };

  // position-first: click an empty slot, then spin for it
  const handlePickSlot = (slotId) => {
    if (phase !== 'spin') return;
    const slot = slots.find(s => s.id === slotId);
    setTargetSlot(slotId);
    handleSpin(slot);
  };

  // candidate players in the spun club
  const candidates = combo ? aflPlayersFor(combo.team, combo.era, pickedIds) : [];
  const targetBucket = targetSlot ? slots.find(s => s.id === targetSlot)?.bucket : null;
  const positionMode = draftMode === 'position';
  const shown = candidates
    .filter(p => {
      if (positionMode) return targetBucket ? p.pos === targetBucket : false;
      // Only surface players whose position still has an open slot — baseball's
      // thin buckets (1 pitcher slot, 3 outfield) otherwise leave un-draftable
      // "dead" entries in the list once a position is filled.
      if (!openBuckets.includes(p.pos)) return false;
      return posFilter === 'All' || p.pos === posFilter;
    })
    .sort((a, b) => b.rating - a.rating);

  const canPlaceAnywhere = (p) => openSlots.some(s => aflSlotAccepts(s.bucket, p.pos));

  // place a player into a specific slot id
  const placeInto = (slotId, player) => {
    const newSlots = slots.map(s => (s.id === slotId ? { ...s, player } : s));
    setSlots(newSlots);
    setSelected(null);
    setTargetSlot(null);
    if (newSlots.every(s => s.player)) {
      // Squad complete — show the bookies' verdict before the first bounce.
      setOdds(aflPreSeasonOdds(newSlots.map(s => ({ bucket: s.bucket, label: s.label, player: s.player }))));
      setPhase('complete');
      return;
    }
    // Two picks per spin: stay on this club if it still has someone usable.
    const newPicked = newSlots.filter(s => s.player).map(s => s.player.id);
    const newOpenBuckets = [...new Set(newSlots.filter(s => !s.player).map(s => s.bucket))];
    const moreHere = combo
      ? aflPlayersFor(combo.team, combo.era, newPicked).some(p => newOpenBuckets.includes(p.pos))
      : false;
    if (comboPicks + 1 < PICKS_PER_SPIN && moreHere) {
      setComboPicks(c => c + 1);
    } else {
      setComboPicks(0);
      setCombo(null);
      setDisplay({ team: '???', era: "??'s" });
      setPhase('spin');
    }
  };

  const handleSimulate = () => {
    const r = aflSimulateSeason(slots.map(s => ({ bucket: s.bucket, label: s.label, player: s.player })));
    setResult(r);
    setPb(recordRun(r));
    setRevealed(0);
    setMinute(0);
    setPhase('simulating');
  };

  const handleSkipAll = () => {
    clearInterval(simTimer.current);
    setRevealed(SEASON_GAMES);
    setMinute(0);
    setPhase('result');
  };

  // squad-first: pick player -> highlight eligible slots -> tap a slot
  const handlePickPlayer = (p) => {
    if (!canPlaceAnywhere(p)) return;
    setSelected(p);
  };

  const handleSlotClick = (slot) => {
    if (slot.player) return;
    if (positionMode) {
      if (phase === 'spin') {
        handlePickSlot(slot.id);
      } else if (phase === 'pick') {
        // Mid-combo: retarget to another open position (2nd pick of the spin).
        setTargetSlot(slot.id);
      }
      return;
    }
    // squad mode: place the selected player if eligible
    if (selected && aflSlotAccepts(slot.bucket, selected.pos)) {
      placeInto(slot.id, selected);
    }
  };

  // position-first: pick a player from the spun club for the target slot
  const handlePickForTarget = (p) => {
    if (!targetSlot) return;
    placeInto(targetSlot, p);
  };

  const handleRestart = () => {
    startDraft();
  };

  const backToSetup = () => {
    clearInterval(spinTimer.current);
    setPhase('setup');
    setResult(null);
  };

  // ----- share -----
  const recordStr = result
    ? (result.draws > 0
        ? `${result.wins}-${result.losses} (${result.draws}D)`
        : `${result.wins}-${result.losses}`)
    : '';
  const shareText = result
    ? fmt(e.shareText || g.shareText, { record: recordStr })
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${SITE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(SITE_URL)}`;

  const handlePoster = () => {
    if (!result) return;
    downloadPoster({
      brand: '162-0 CHALLENGE',
      record: `${result.wins}-${result.losses}`,
      draws: result.draws,
      grade: result.grade,
      title: e.titles?.[result.title] || g.titles?.[result.title] || '',
      points: result.points,
      lineup: slots.map(s => ({
        pos: s.label,
        bucket: s.bucket,
        name: s.player.name,
        rating: s.player.rating,
      })),
      star: result.best
        ? { name: result.best.name, sub: result.best.club, rating: result.best.rating }
        : null,
      meta: [
        STRUCTURE_LABEL,
        eraFilter || 'All-time',
        difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        draftMode === 'position' ? 'Position' : 'Squad',
      ].join('  ·  '),
      url: 'www.82-0-challenge.com/162-0',
      daily: null,
    });
  };

  // ===================== SETUP =====================
  if (phase === 'setup') {
    return (
      <div className={styles.game} ref={rootRef}>
        <div className={styles.setupHead}>
          <h2 className={styles.setupTitle}>{g.setupTitle || 'Build Your 18'}</h2>
          <p className={styles.setupSub}>{g.setupSub || 'Configure your all-time draft, then spin.'}</p>
        </div>

        {/* Live oval preview — the classic 18: 6 back, 6 mid, 6 forward */}
        <div className={styles.pitchPreview}>
          <Oval slots={buildSlots(STRUCTURE)} blind interactive={false} styles={styles} />
        </div>

        {/* Difficulty */}
        <div className={styles.cfgGroup}>
          <span className={styles.cfgLabel}>{g.difficulty || 'Difficulty'}</span>
          <div className={styles.optRow}>
            {[
              ['easy', g.diffEasy || 'Easy', g.diffEasyDesc || '3 rerolls'],
              ['normal', g.diffNormal || 'Normal', g.diffNormalDesc || '1 reroll'],
              ['hard', g.diffHard || 'Hard', g.diffHardDesc || 'No rerolls · ratings hidden'],
            ].map(([id, name, desc]) => (
              <button
                key={id}
                className={`${styles.optCard} ${difficulty === id ? styles.optActive : ''}`}
                onClick={() => setDifficulty(id)}
              >
                <b>{name}</b>
                <small>{desc}</small>
              </button>
            ))}
          </div>
        </div>

        {/* Show ratings */}
        <div className={styles.cfgGroup}>
          <span className={styles.cfgLabel}>{g.showRatings || 'Show Ratings'}</span>
          <div className={styles.optRow}>
            <button
              className={`${styles.optCard} ${showRatings && difficulty !== 'hard' ? styles.optActive : ''} ${difficulty === 'hard' ? styles.optLocked : ''}`}
              onClick={() => difficulty !== 'hard' && setShowRatings(true)}
            >
              <b>{g.ratingsOn || 'On'}</b>
              <small>{g.ratingsOnDesc || 'Player overalls visible'}</small>
            </button>
            <button
              className={`${styles.optCard} ${(!showRatings || difficulty === 'hard') ? styles.optActive : ''}`}
              onClick={() => difficulty !== 'hard' && setShowRatings(false)}
            >
              <b>{g.ratingsOff || 'Off'}</b>
              <small>{g.ratingsOffDesc || 'Blind mode — trust your gut'}</small>
            </button>
          </div>
        </div>

        {/* Draft mode */}
        <div className={styles.cfgGroup}>
          <span className={styles.cfgLabel}>{g.draftMode || 'Draft Mode'}</span>
          <div className={styles.optRow}>
            <button
              className={`${styles.optCard} ${draftMode === 'squad' ? styles.optActive : ''}`}
              onClick={() => setDraftMode('squad')}
            >
              <b>{g.squadFirst || 'Squad First'}</b>
              <small>{g.squadFirstDesc || 'Spin a club, pick two players, choose their spots'}</small>
            </button>
            <button
              className={`${styles.optCard} ${draftMode === 'position' ? styles.optActive : ''}`}
              onClick={() => setDraftMode('position')}
            >
              <b>{g.positionFirst || 'Position First'}</b>
              <small>{g.positionFirstDesc || 'Pick a spot, then spin a club to fill it'}</small>
            </button>
          </div>
        </div>

        {/* Era */}
        <div className={styles.cfgGroup}>
          <span className={styles.cfgLabel}>{g.era || 'Era'}</span>
          <div className={styles.chipRow}>
            <button
              className={`${styles.chip} ${eraFilter === '' ? styles.chipActive : ''}`}
              onClick={() => setEraFilter('')}
            >
              {g.eraAll || 'All-time'}
            </button>
            {AFL_ERAS.map(era => (
              <button
                key={era}
                className={`${styles.chip} ${eraFilter === era ? styles.chipActive : ''}`}
                onClick={() => setEraFilter(era)}
              >
                {era}
              </button>
            ))}
          </div>
        </div>

        <button className={styles.startBtn} onClick={startDraft}>
          {g.startDraft || 'Start Draft →'}
        </button>
      </div>
    );
  }

  // ===================== SQUAD COMPLETE — PRE-SEASON ODDS =====================
  if (phase === 'complete' && odds) {
    return (
      <div className={styles.game} ref={rootRef}>
        <div className={styles.resultCard}>
          <div className={styles.modeBadge}>
            {STRUCTURE_LABEL} · {g[draftMode === 'squad' ? 'squadFirst' : 'positionFirst'] || draftMode}
          </div>
          <h2 className={styles.completeTitle}>🏆 {e.squadComplete || 'Squad Complete'}</h2>
          <p className={styles.completeSub}>{e.squadCompleteSub || "Here's what the bookies make of your 18. Simulate the season and chase the impossible."}</p>

          <LineupRecap slots={slots} blind={blind} styles={styles} />

          <div className={styles.oddsCard}>
            <div className={styles.oddsHead}>
              <span className={styles.oddsTag}>{e.preSeasonOdds || 'Pre-Season Odds'}</span>
            </div>
            <div className={styles.oddsTop}>
              <div>
                <span className={styles.oddsTopLabel}>{e.projectedFinish || 'Projected Finish'}</span>
                <b className={styles.oddsTopValue}>#{odds.projectedFinish}</b>
              </div>
              <div className={styles.oddsTopRight}>
                <span className={styles.oddsTopLabel}>{e.expectedPoints || 'Expected Points'}</span>
                <b className={`${styles.oddsTopValue} ${styles.oddsPts}`}>{odds.expPts}</b>
              </div>
            </div>
            {[
              [e.oddWin || 'Minor premiership', odds.winLeague, styles.barGold],
              [e.oddTop4 || 'Top 4', odds.top4, styles.barGreen],
              [e.oddTop8 || 'Play finals (Top 8)', odds.top8, styles.barBlue],
              [e.oddSpoon || 'Wooden spoon', odds.spoon, styles.barRed],
              [e.oddPerfect || 'Perfect 23-0', odds.perfect, styles.barFire],
            ].map(([label, value, barCls]) => (
              <div key={label} className={styles.oddsRow}>
                <span className={styles.oddsLabel}>{label}</span>
                <span className={styles.oddsValue}>{value ? `${value}%` : '<0.1%'}</span>
                <span className={styles.oddsBar}>
                  <span className={`${styles.oddsBarFill} ${barCls}`} style={{ width: `${Math.max(value, 0.6)}%` }} />
                </span>
              </div>
            ))}
            <p className={styles.oddsHint}>{e.oddsHint || 'What your 18 should produce. Simulate to see if you beat it.'}</p>
          </div>

          <button className={styles.simulateBtn} onClick={handleSimulate}>
            {e.simulate || 'Simulate Season →'}
          </button>
          <div className={styles.resultActions}>
            <button className={styles.secondaryBtn} onClick={handleRestart}>{g.playAgain}</button>
            <button className={styles.secondaryBtn} onClick={backToSetup}>{g.newSetup || 'New Setup'}</button>
          </div>
        </div>
      </div>
    );
  }

  // ===================== SIMULATING — ROUND BY ROUND =====================
  if (phase === 'simulating' && result) {
    const shownMatches = result.matches.slice(0, revealed);
    const tally = shownMatches.reduce(
      (a, m) => ({ w: a.w + (m.res === 'W'), d: a.d + (m.res === 'D'), l: a.l + (m.res === 'L') }),
      { w: 0, d: 0, l: 0 }
    );

    // The game currently being played out on the oval.
    const cur = result.matches[Math.min(revealed, SEASON_GAMES - 1)];
    const atFT = revealed >= SEASON_GAMES || minute >= GAME_MINS;
    // Our goals come from real scorer minutes; everything else is spread.
    const ourBehindMins = spreadMinutes(cur.b);
    const oppGoalMins = spreadMinutes(cur.og);
    const oppBehindMins = spreadMinutes(cur.ob);
    const liveG = atFT ? cur.g : cur.scorers.filter(sc => sc.min <= minute).length;
    const liveB = atFT ? cur.b : ourBehindMins.filter(m => m <= minute).length;
    const liveOG = atFT ? cur.og : oppGoalMins.filter(m => m <= minute).length;
    const liveOB = atFT ? cur.ob : oppBehindMins.filter(m => m <= minute).length;

    const goalsBySlot = {};
    cur.scorers.forEach(sc => {
      if (sc.min > minute && !atFT) return;
      const slot = slots.find(s => s.player.name === sc.name);
      if (slot) (goalsBySlot[slot.id] = goalsBySlot[slot.id] || []).push(sc.min);
    });
    const live = {
      goals: goalsBySlot,
      defPulse: !atFT && oppGoalMins.some(m => m <= minute && minute - m < 24),
      lockGlow: atFT && cur.opts === 0,
    };
    const boardCls = atFT
      ? (cur.res === 'W' ? styles.boardWin : cur.res === 'D' ? styles.boardDraw : styles.boardLoss)
      : '';

    return (
      <div className={styles.game} ref={rootRef}>
        <div className={styles.simHeader}>
          <span className={styles.simWeek}>
            {fmt(e.matchweek || 'Round {n} / 23', { n: Math.min(revealed + 1, SEASON_GAMES) })}
          </span>
          <span className={styles.simTally}>
            <b className={styles.tw}>{tally.w}W</b>
            <b className={styles.td}>{tally.d}D</b>
            <b className={styles.tl}>{tally.l}L</b>
          </span>
          <button className={styles.skipBtn} onClick={handleSkipAll}>
            {e.skipAll || 'Skip to result →'}
          </button>
        </div>

        <div className={styles.draftBody}>
          {/* Live oval — the season plays out in front of your 18 */}
          <div className={styles.courtPanel}>
            <div className={`${styles.scoreBoard} ${boardCls}`}>
              <span className={styles.boardTeam}>{e.yourXI || 'Your 18'}</span>
              <span className={styles.boardScore}>{scoreline(liveG, liveB)}–{scoreline(liveOG, liveOB)}</span>
              <span className={`${styles.boardTeam} ${styles.boardOpp}`}>
                {cur.opp} <i>({cur.home ? 'H' : 'A'})</i>
              </span>
              <span className={styles.boardClock}>{atFT ? 'Final' : quarterLabel(minute)}</span>
            </div>
            <Oval slots={slots} blind={false} interactive={false} live={live} styles={styles} />
          </div>

          {/* Played rounds roll in alongside */}
          <div className={styles.playerPanel}>
            <div className={styles.matchList}>
              {[...shownMatches].reverse().map(m => (
                <MatchCard key={m.wk} m={m} styles={styles} compact />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================== RESULT =====================
  if (phase === 'result' && result) {
    const narrKey =
      result.wins === SEASON_GAMES ? 'narrPerfect'
      : result.losses === 0 ? 'narrInvincible'
      : result.position === 1 ? 'narrChampions'
      : result.verdict === 'over' ? 'narrOver'
      : result.verdict === 'under' ? 'narrUnder'
      : 'narrOn';
    const narrative = fmt(e[narrKey] || '', {
      wins: result.wins,
      draws: result.draws,
      losses: result.losses,
      points: result.leaguePts,
      position: `#${result.position}`,
      projected: `#${result.projectedFinish}`,
      star: result.best.name,
    });
    const verdictCls =
      result.verdict === 'over' ? styles.verdictOver
      : result.verdict === 'under' ? styles.verdictUnder
      : styles.verdictOn;
    const verdictLabel =
      result.verdict === 'over' ? (e.over || 'Overperformed')
      : result.verdict === 'under' ? (e.under || 'Underperformed')
      : (e.onTarget || 'On Script');
    const sortedStats = [...result.playerStats].sort(
      (a, b) => (b.goals * 2 + b.assists) - (a.goals * 2 + a.assists)
    );

    return (
      <div className={styles.game} ref={rootRef}>
        <div className={styles.resultCard}>
          <div className={styles.modeBadge}>
            {STRUCTURE_LABEL} · {g[draftMode === 'squad' ? 'squadFirst' : 'positionFirst'] || draftMode}
          </div>
          <div className={styles.resultLabel}>{g.projectedRecord}</div>
          <div className={styles.resultRecord}>{result.wins}–{result.losses}</div>
          <div className={styles.recordCaption}>
            {result.draws > 0
              ? `${result.wins} ${e.winsL || 'Won'} · ${result.draws} ${e.drawsL || 'Drawn'} · ${result.losses} ${e.lossesL || 'Lost'}`
              : `${e.winsL || 'Won'} · ${e.lossesL || 'Lost'}`}
          </div>
          <div className={styles.gradeRow}>
            <span className={styles.gradeBadge}>{result.grade}</span>
            <span className={styles.gradeTitle}>{e.titles?.[result.title] || g.titles?.[result.title]}</span>
            <span className={styles.gradePts}>· {result.points} {g.pts}</span>
          </div>

          {/* Personal best + run counter */}
          {pb && (
            <div className={styles.pbLine}>
              {pb.isNewBest && <span className={styles.pbNew}>★ {e.newBest || 'New personal best!'}</span>}
              <span>
                {e.yourBest || 'Your best'}: <b>{pb.best.wins === SEASON_GAMES ? '23-0' : `${pb.best.wins}-${pb.best.draws}-${pb.best.losses}`}</b>
                {' · '}{fmt(e.runN || 'Run #{n}', { n: pb.runs })}
              </span>
            </div>
          )}

          {/* So close — fuel the next run */}
          {result.wins < SEASON_GAMES && SEASON_GAMES - result.wins <= 3 && (
            <div className={styles.nearMiss}>
              🔥 {fmt(e.nearMiss || 'Only {n} results away from a perfect 23-0 — run it back.', { n: SEASON_GAMES - result.wins })}
            </div>
          )}

          {/* Finished vs projected */}
          <div className={styles.finishGrid}>
            <div className={styles.finishCell}>
              <span>{e.finished || 'Finished'}</span>
              <b>#{result.position}</b>
            </div>
            <div className={styles.finishCell}>
              <span>{e.projected || 'Projected'}</span>
              <b className={styles.finishMuted}>#{result.projectedFinish}</b>
            </div>
            <div className={`${styles.finishCell} ${verdictCls}`}>
              <b className={styles.verdictText}>{verdictLabel}</b>
            </div>
          </div>

          {narrative && (
            <div className={styles.narrativeCard}>
              <p>{narrative}</p>
            </div>
          )}

          {/* Season numbers */}
          <div className={styles.statGrid}>
            {[
              [result.wins, e.winsL || 'Wins', styles.tw],
              [result.draws, e.drawsL || 'Draws', styles.td],
              [result.losses, e.lossesL || 'Losses', styles.tl],
              [result.leaguePts, e.ptsL || 'Ladder Points', ''],
              [result.gf, e.gfL || 'Points For', styles.tw],
              [result.ga, e.gaL || 'Points Against', styles.tl],
            ].map(([v, label, cls]) => (
              <div key={label} className={styles.statBox}>
                <b className={cls}>{v}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Season awards */}
          <div className={styles.sectionLabel}>{e.seasonAwards || 'Season Awards'}</div>
          <div className={styles.awardsGrid}>
            <div className={styles.awardCard}>
              <span className={styles.awardTag}>🏉 {e.goldenBoot || 'Leading Goalkicker'}</span>
              <b>{result.awards.boot.name}</b>
              <small>{fmt(e.goalsN || '{n} goals', { n: result.awards.boot.goals })}</small>
            </div>
            <div className={styles.awardCard}>
              <span className={styles.awardTag}>🎯 {e.playmakerAward || 'Most Goal Assists'}</span>
              <b>{result.awards.playmaker.name}</b>
              <small>{fmt(e.assistsN || '{n} goal assists', { n: result.awards.playmaker.assists })}</small>
            </div>
            {result.awards.glove && (
              <div className={styles.awardCard}>
                <span className={styles.awardTag}>🧤 {e.goldenGlove || 'Defender of the Year'}</span>
                <b>{result.awards.glove.name}</b>
                <small>{fmt(e.csN || '{n} lockdowns', { n: result.awards.glove.cs })}</small>
              </div>
            )}
            <div className={`${styles.awardCard} ${styles.awardPots}`}>
              <span className={styles.awardTag}>🏆 {e.potsAward || 'Player of the Season'}</span>
              <b>{result.awards.pots.name}</b>
              <small>{result.awards.pots.goals}G · {result.awards.pots.assists}A</small>
            </div>
          </div>

          {/* Per-player stats */}
          <div className={styles.statsTableWrap}>
            <div className={styles.statsTableHead}>
              <span>{e.playerCol || 'Player'}</span>
              <span>{e.gShort || 'G'}</span>
              <span>{e.aShort || 'A'}</span>
              <span>{e.csShort || 'LD'}</span>
            </div>
            {sortedStats.map(p => (
              <div key={p.name + p.label} className={styles.statsTableRow}>
                <span className={styles.statsPlayer}>
                  <i className={styles.statsPos}>{p.label}</i>
                  {p.name}
                </span>
                <span className={p.goals ? styles.tw : styles.dim}>{p.goals || '·'}</span>
                <span className={p.assists ? styles.td : styles.dim}>{p.assists || '·'}</span>
                <span className={p.cs ? '' : styles.dim}>
                  {p.bucket === 'DEF' ? (p.cs || '·') : '·'}
                </span>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className={styles.hlGrid}>
            <div className={styles.hlCard}>
              <b>{result.cleanSheets}</b>
              <span>{e.cleanSheetsL || 'Lockdowns (<60 conceded)'}</span>
            </div>
            <div className={styles.hlCard}>
              <b>{result.bestStreak}</b>
              <span>{e.winStreak || 'Longest Win Streak'}</span>
            </div>
            {result.biggestWin && (
              <div className={styles.hlCard}>
                <b className={styles.tw}>{result.biggestWin.pts - result.biggestWin.opts}</b>
                <span>{e.biggestWinL || 'Biggest Win (margin)'} · {result.biggestWin.opp}</span>
              </div>
            )}
            {result.highScoring && (
              <div className={styles.hlCard}>
                <b>{scoreline(result.highScoring.g, result.highScoring.b)}</b>
                <span>{e.highScoringL || 'Highest Score'} · {result.highScoring.opp}</span>
              </div>
            )}
          </div>

          {/* Final ladder */}
          <details className={styles.foldable}>
            <summary>{e.finalTable || 'Final Ladder'}</summary>
            <div className={styles.leagueTable}>
              <div className={`${styles.tableRow} ${styles.tableHeadRow}`}>
                <span>#</span>
                <span className={styles.tableClub}>{e.clubCol || 'Club'}</span>
                <span>{e.gdShort || '%'}</span>
                <span>{e.ptsShort || 'PTS'}</span>
              </div>
              {result.table.map((r, i) => (
                <div key={r.name} className={`${styles.tableRow} ${r.you ? styles.tableYou : ''}`}>
                  <span>{i + 1}</span>
                  <span className={styles.tableClub}>{r.you ? (e.yourXI || 'Your 18') : r.name}</span>
                  <span>{r.pct}</span>
                  <span><b>{r.pts}</b></span>
                </div>
              ))}
            </div>
          </details>

          {/* Season results */}
          <details className={styles.foldable}>
            <summary>{e.seasonResults || 'Season Results'}</summary>
            <div className={styles.matchList}>
              {result.matches.map(m => (
                <MatchCard key={m.wk} m={m} styles={styles} compact />
              ))}
            </div>
          </details>

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

          <LineupRecap slots={slots} blind={false} styles={styles} />

          <div className={styles.resultActionsWrap}>
            {/* Row 1 — share & community */}
            <div className={styles.resultActions}>
              <button className={styles.secondaryBtn} onClick={handlePoster}>
                {g.poster || 'Download Poster'}
              </button>
              <button className={styles.secondaryBtn} onClick={handleCopy}>
                {copied ? g.copied : g.copyResult}
              </button>
              <a className={styles.secondaryBtn} href={xShareUrl} target="_blank" rel="noopener noreferrer">
                {g.shareOnX}
              </a>
            </div>
            {/* Row 2 — play again */}
            <div className={styles.resultActions}>
              <button className={styles.primaryBtn} onClick={handleRestart}>{g.playAgain}</button>
              <button className={styles.secondaryBtn} onClick={backToSetup}>{g.newSetup || 'New Setup'}</button>
            </div>
            <Link href="/tips" className={styles.tipsLink}>
              💡 {e.tipsCta || 'Want a better record? Read the official tips →'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===================== DRAFT =====================
  const eligibleSlotId = (slot) => {
    if (slot.player) return false;
    if (positionMode) return phase === 'spin' || phase === 'pick';
    return selected && aflSlotAccepts(slot.bucket, selected.pos);
  };
  const picksLeft = PICKS_PER_SPIN - comboPicks;

  return (
    <div className={styles.game} ref={rootRef}>
      <div className={styles.draftHeader}>
        <span className={styles.roundBadge}>{fmt(g.roundOf, { round, total: totalRounds })}</span>
        <span className={styles.formationTag}>{STRUCTURE_LABEL}</span>
        {DIFFICULTIES[difficulty].rerolls > 0 && (
          <button className={styles.skipBtn} onClick={handleReroll} disabled={rerolls <= 0 || phase !== 'pick' || comboPicks > 0}>
            🔁 {g.reroll || 'Reroll'} ({rerolls})
          </button>
        )}
      </div>

      <div className={styles.draftBody}>
        {/* Oval — always visible */}
        <div className={styles.courtPanel}>
          <Oval
            slots={slots}
            blind={blind}
            interactive
            eligible={eligibleSlotId}
            targetSlot={targetSlot}
            onSlot={handleSlotClick}
            styles={styles}
          />
        </div>

        {/* Spin + player list */}
        <div className={styles.playerPanel}>
          <div className={styles.slotMachine}>
            <div className={`${styles.slotWindow} ${styles.slotTeam} ${phase === 'spinning' ? styles.slotSpinning : ''}`}>
              <span className={styles.slotLabel}>{g.team}</span>
              <span className={styles.slotValue}>{display.team}</span>
            </div>
            <div className={`${styles.slotWindow} ${styles.slotEra} ${phase === 'spinning' ? styles.slotSpinning : ''}`}>
              <span className={styles.slotLabel}>{g.era}</span>
              <span className={styles.slotValue}>{display.era}</span>
            </div>
          </div>

          {phase === 'spin' && (
            positionMode ? (
              <div className={styles.spinHint}>{g.pickSlotHint || 'Tap an open position on the oval to spin for it.'}</div>
            ) : (
              <button className={styles.spinBtn} onClick={() => handleSpin()} style={{ width: '100%' }}>
                {g.spin}
              </button>
            )
          )}
          {phase === 'spinning' && (
            <button className={styles.spinBtn} disabled style={{ width: '100%' }}>{g.spinning}</button>
          )}

          {phase === 'pick' && (
            <>
              <div className={styles.targetBar}>
                {fmt(g.pickTwo || 'Take {n} from this club', { n: picksLeft })}
              </div>
              {!positionMode && (
                <div className={styles.listToolbar}>
                  {['All', 'DEF', 'MID', 'FWD'].filter(f => f === 'All' || openBuckets.includes(f)).map(f => (
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
              )}
              {positionMode && (
                <div className={styles.targetBar}>
                  {targetSlot
                    ? fmt(g.fillingSlot || 'Filling: {slot}', { slot: slots.find(s => s.id === targetSlot)?.label || '' })
                    : (g.pickNextSlot || 'Tap another open position for this pick.')}
                </div>
              )}
              <div className={styles.playerList}>
                {shown.map(p => {
                  const placeable = positionMode ? true : canPlaceAnywhere(p);
                  const isSel = !positionMode && selected?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      className={`${styles.playerRow} ${isSel ? styles.playerSelected : ''} ${!placeable ? styles.playerBlocked : ''}`}
                      onClick={() => positionMode ? handlePickForTarget(p) : handlePickPlayer(p)}
                      disabled={!placeable}
                    >
                      <span className={styles.playerInfo}>
                        <b>{p.name}</b>
                        <span className={styles.playerPos}>{p.pos}</span>
                        <small>{p.club} · {p.era}</small>
                      </span>
                      {!blind && (
                        <span className={styles.statLine}>
                          <span>{p.rating}<i>OVR</i></span>
                          <span className={styles.nflStat}>{p.stat1}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {selected && !positionMode && (
                <div className={styles.placingBar}>
                  {fmt(g.placing, { name: selected.name })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Lineup recap (squad-complete + result screens) -----
function LineupRecap({ slots, blind, styles }) {
  return (
    <div className={styles.lineupRecap}>
      {slots.map(s => (
        <div key={s.id} className={styles.recapRow}>
          <span className={`${styles.recapChip} ${styles[`chip${s.bucket}`] || ''}`}>
            <b>{initials(s.player.name)}</b>
            <i>{s.label}</i>
          </span>
          <span className={styles.recapName}>
            {s.player.name}
            <small>{s.player.club} · {s.player.era}</small>
          </span>
          {!blind && (
            <span className={styles.recapStats}>
              <span>{s.player.rating}<i>OVR</i></span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ----- One round result card -----
function MatchCard({ m, styles, compact }) {
  const resCls = m.res === 'W' ? styles.matchWin : m.res === 'D' ? styles.matchDraw : styles.matchLoss;
  return (
    <div className={`${styles.matchCard} ${resCls} ${compact ? styles.matchCompact : ''}`}>
      <span className={styles.matchRes}>{m.res}</span>
      <span className={styles.matchOpp}>
        {m.opp} <i>({m.home ? 'H' : 'A'})</i>
        {!compact && m.scorers.length > 0 && (
          <small className={styles.matchScorers}>
            🏉 {m.scorers.map(sc => `${sc.name} ${sc.min}'`).join('  ')}
          </small>
        )}
      </span>
      <span className={styles.matchScore}>{scoreline(m.g, m.b)}–{scoreline(m.og, m.ob)}</span>
    </div>
  );
}

// ----- Vertical oval component -----
// `live` (optional, simulation phase): { goals: {slotId: [minutes]},
// defPulse: defence under siege, lockGlow: held them under 60 at the siren }.
function Oval({ slots, blind, interactive, eligible, targetSlot, onSlot, live, styles }) {
  return (
    <div className={styles.pitch}>
      <div className={styles.pitchLines}>
        <span className={styles.ovalBoundary} />
        <span className={styles.arcTop} />
        <span className={styles.arcBottom} />
        <span className={styles.centreSquare} />
        <span className={styles.pitchCircle} />
        <span className={styles.goalSquareTop} />
        <span className={styles.goalSquareBottom} />
      </div>
      {slots.map(s => {
        const isEligible = interactive && eligible && eligible(s);
        const isTarget = s.id === targetSlot;
        const goals = live?.goals?.[s.id];
        const conceding = live?.defPulse && s.label === 'FB';
        const clean = live?.lockGlow && s.bucket === 'DEF';
        const cls = [
          styles.pitchSlot,
          s.player ? styles.slotFilled : '',
          s.player ? styles[`chip${s.bucket}`] : '',
          isEligible ? styles.slotEligible : '',
          isTarget ? styles.slotTarget : '',
          goals ? styles.slotGoal : '',
          conceding ? styles.slotConcede : '',
          clean ? styles.slotClean : '',
        ].join(' ');
        return (
          <button
            key={s.id}
            className={cls}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            onClick={() => interactive && onSlot && onSlot(s)}
          >
            {s.player ? (
              <>
                <b>{initials(s.player.name)}</b>
                <i>{blind ? s.label : s.player.rating}</i>
              </>
            ) : (
              <span>{s.label}</span>
            )}
            {goals && (
              <span key={goals.length} className={styles.goalBubble}>
                🏉 {goals[goals.length - 1]}'{goals.length > 1 ? ` ×${goals.length}` : ''}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
