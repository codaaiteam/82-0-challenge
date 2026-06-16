'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import styles from './Game.module.css';
import {
  DECADES, ALL_TEAMS, PLAYSTYLE_IDS, PLAYSTYLES,
  playersFor, spinCombo, rerollTeam, rerollEra, simulateSeason, randomPick,
  dailyCombos, comboIsDraftable, buildSlots, buildSeasonStory,
  FILTERS, priceOf, CAP_BUDGET, MIN_PRICE, gauntletBudget, CAP_STEP, CAP_FLOOR,
} from '@/lib/engine';
import { dateKey, hashStr, mulberry32, msToNextUtcMidnight } from '@/lib/seeded';
import { downloadPoster } from '@/lib/poster';
import { submitScore, saveSubmission } from '@/lib/leaderboard';
import ShareModal from './ShareModal';
import MiniCourt from './MiniCourt';

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

// ── C2Story "turn my team into a storybook" deep link ───────────────────────
// Normalises this exact playthrough — record, MVP, weakness, playstyle, squad
// and the season's standout games — into a compact payload so c2story writes a
// DIFFERENT illustrated book for every run, not a generic perfect-season tale.
const STORY_BASE = 'https://c2story.com/dream-team-storybook';
const STORY_WEAKNESS = {
  weakScoring: 'found buckets hard to come by',
  weakRebounding: 'kept getting out-rebounded',
  weakPlaymaking: 'struggled to move the ball as a unit',
  weakSteals: 'let too many balls slip through their hands',
  weakBlocks: 'could not protect the rim',
  overall: 'fought hard but lacked a true superstar edge',
  consistency: 'had the talent but ran hot and cold',
};
const STORY_STYLE = {
  balanced: 'a balanced starting five',
  smallball: 'a quick, switch-everything small-ball five',
  twintowers: 'a towering twin-big lineup',
  rungun: 'a run-and-gun, fast-break five',
};

function buildStoryUrl(result, slots, story, playstyle, lang) {
  const players = slots
    .filter(s => s.player)
    .map(s => ({ n: s.player.name, pos: s.pos, r: s.player.rating }));

  // Pick the most vivid season beats; c2story illustrates the first two.
  const moments = [];
  if (story && story.games && story.moments) {
    const byKey = {};
    Object.entries(story.moments).forEach(([idx, k]) => { byKey[k] = +idx; });
    let bigIdx = -1, bigMargin = -1;
    story.games.forEach((gm, i) => {
      if (gm.win && gm.us - gm.them > bigMargin) { bigMargin = gm.us - gm.them; bigIdx = i; }
    });
    const add = (k, i) => {
      if (i == null || i < 0) return;
      const gm = story.games[i];
      if (gm) moments.push({ k, opp: gm.opp, score: `${gm.us}-${gm.them}` });
    };
    add(byKey.closestWin != null ? 'closestWin' : 'closestLoss', byKey.closestWin ?? byKey.closestLoss);
    add('biggestWin', bigIdx);
    add('win50', byKey.win50);
    add('finale', byKey.finale);
  }

  const payload = {
    rec: `${result.wins}-${result.losses}`,
    title: result.title,
    mvp: result.best?.name,
    flaw: STORY_WEAKNESS[result.weakness],
    style: STORY_STYLE[playstyle],
    players,
    moments,
  };

  // base64url so it survives the querystring untouched.
  const data = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const langQ = lang && lang !== 'en' ? `&lang=${encodeURIComponent(lang)}` : '';
  return `${STORY_BASE}?game=82-0&data=${data}${langQ}&utm_source=82-0-challenge&utm_medium=result_story`;
}

export default function GameMain({ t, initialMode = null, variant = null }) {
  const g = t?.game || {};
  const lb = g.lb || {};
  const cap = g.cap || {};
  const routeParams = useParams();
  const langPrefix = routeParams?.lang && routeParams.lang !== 'en' ? `/${routeParams.lang}` : '';

  // A Challenge Filter / Cap variant short-circuits the setup screen and plays
  // straight away. filterCfg drives the draftable pool, difficulty and the
  // leaderboard tag; isCap swaps the spin draft for the free-draft cap UI.
  const filterCfg = variant ? FILTERS[variant.id] : null;
  const isCap = !!filterCfg?.cap;
  // activeParam = the chosen team (oneFranchise) or decade (oneDecade/randomEra);
  // randomEra re-rolls it on every replay for a fresh surprise.
  const [activeParam, setActiveParam] = useState(variant?.param ?? null);
  const difficulty = filterCfg?.difficulty || 1;
  // Cap Mode gauntlet level (1-based); budget tightens each cleared level.
  const [capLevel, setCapLevel] = useState(1);

  // mode: null (setup screen) | 'standard' | 'daily' | 'cap'
  const [mode, setMode] = useState(variant ? (isCap ? 'cap' : 'standard') : initialMode);
  // playstyle: 5-slot position template (lineup shape)
  const [playstyle, setPlaystyle] = useState('balanced');
  // setup options
  const [showStats, setShowStats] = useState(true);       // stat lines visible while drafting
  const [revealMode, setRevealMode] = useState('watch');  // 'watch' = season sim · 'instant' = straight to result
  // phase: 'spin' | 'spinning' | 'pick' | 'sim' | 'result'
  const [phase, setPhase] = useState('spin');
  const [round, setRound] = useState(1);
  const [slots, setSlots] = useState(() => buildSlots('balanced'));
  const [combo, setCombo] = useState(null);          // settled {team, decade}
  const [display, setDisplay] = useState({ team: '???', decade: "??'s" }); // slot windows
  const [selected, setSelected] = useState(null);     // player awaiting placement
  const [posFilter, setPosFilter] = useState('All');
  // Cap Mode draft is spin-gated within a budget, so a stingy 1+1 leaves runs
  // dead on arrival when the spins are unkind. Give it room to find a build.
  const [teamSkips, setTeamSkips] = useState(isCap ? 3 : 1);
  const [eraSkips, setEraSkips] = useState(isCap ? 3 : 1);
  // Cap Mode: a few do-overs so a finished five can be fine-tuned (tap a
  // placed player to swap him out) instead of living with one unlucky spin.
  const [capSwaps, setCapSwaps] = useState(isCap ? 2 : 0);
  const [result, setResult] = useState(null);
  const [story, setStory] = useState(null);   // game-by-game season reveal
  const [simIdx, setSimIdx] = useState(0);    // games revealed so far
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [dailyDone, setDailyDone] = useState(false);
  const [lbName, setLbName] = useState('');
  const [lbState, setLbState] = useState(null); // null | 'sending' | 'error' | { rank, ... }
  const spinTimer = useRef(null);
  const dailySeq = useRef(null);

  const lineup = slots.filter(s => s.player).map(s => s.player);
  const pickedIds = lineup.map(p => p.id);
  const openSlots = slots.filter(s => !s.player).map(s => s.pos);
  const isDaily = mode === 'daily';
  const dailyStorageKey = `daily820:${dateKey()}`;

  // Cap Mode budget tracking + the leaderboard mode tag for this variant.
  const capBudget = isCap ? gauntletBudget(capLevel) : CAP_BUDGET;
  const capSpent = lineup.reduce((sum, p) => sum + priceOf(p), 0);
  const capLeft = capBudget - capSpent;
  const atFloor = capBudget <= CAP_FLOOR;
  const lbTag = filterCfg ? filterCfg.lbTag : (isDaily ? 'daily' : 'standard');

  // The draftable-pool predicate threaded into the spin/pick helpers. Cap Mode
  // keeps the classic roll, but only surfaces players you can afford *and* still
  // leave at least MIN_PRICE for every remaining slot — so you can never spend
  // yourself into a dead end. Other filters use their static pool predicate.
  const capMaxSpend = capLeft - Math.max(0, openSlots.length - 1) * MIN_PRICE;
  const poolFilter = isCap
    ? (p => priceOf(p) <= capMaxSpend)
    : (filterCfg ? filterCfg.pool(activeParam) : undefined);

  useEffect(() => () => clearInterval(spinTimer.current), []);

  // Daily mode: same seeded spins for everyone; one attempt per day.
  useEffect(() => {
    if (!isDaily) return;
    dailySeq.current = dailyCombos(mulberry32(hashStr('82-0:' + dateKey())));
    try {
      const saved = localStorage.getItem(dailyStorageKey);
      if (saved) {
        const { slots: savedSlots, result: savedResult } = JSON.parse(saved);
        // Only restore the new array-shaped slots; stale object-shaped saves
        // from an older build are ignored (they self-heal the next day).
        if (Array.isArray(savedSlots)) {
          setSlots(savedSlots);
          setResult(savedResult);
          setDailyDone(true);
          setPhase('result');
        }
      }
    } catch { /* corrupt storage — let them play */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDaily]);

  // Season-sim ticker: rip through the 82 games, pausing on key moments.
  useEffect(() => {
    if (phase !== 'sim' || !story) return;
    if (simIdx >= story.games.length) {
      const tm = setTimeout(() => setPhase('result'), 1100);
      return () => clearTimeout(tm);
    }
    // The pause belongs to the game currently on screen (simIdx - 1).
    const delay = simIdx === 0 ? 500 : story.moments[simIdx - 1] ? 900 : 24;
    const tm = setTimeout(() => setSimIdx(i => i + 1), delay);
    return () => clearTimeout(tm);
  }, [phase, simIdx, story]);

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
    if (isDaily && dailySeq.current) {
      const next = dailySeq.current[lineup.length];
      if (next && comboIsDraftable(next, pickedIds, openSlots)) {
        animateTo(next);
        return;
      }
    }
    animateTo(spinCombo(pickedIds, openSlots, undefined, poolFilter));
  };

  const handleTeamSkip = () => {
    if (teamSkips <= 0 || phase !== 'pick') return;
    setTeamSkips(teamSkips - 1);
    animateTo(rerollTeam(combo, pickedIds, openSlots, poolFilter));
  };

  const handleEraSkip = () => {
    if (eraSkips <= 0 || phase !== 'pick') return;
    setEraSkips(eraSkips - 1);
    animateTo(rerollEra(combo, pickedIds, openSlots, poolFilter));
  };

  // ---- picking & placing ----
  const candidates = combo ? playersFor(combo.team, combo.decade, pickedIds, poolFilter) : [];
  const shown = candidates
    .filter(p => {
      if (posFilter === 'All') return true;
      if (posFilter === 'G') return p.positions.some(x => x === 'PG' || x === 'SG');
      if (posFilter === 'F') return p.positions.some(x => x === 'SF' || x === 'PF');
      return p.positions.includes('C');
    })
    .sort((a, b) => b.pts - a.pts);

  const canPlace = (p) => p.positions.some(pos => openSlots.includes(pos));

  const handlePlace = (slotId) => {
    const slot = slots.find(s => s.id === slotId);
    if (!selected || !slot || slot.player || !selected.positions.includes(slot.pos)) return;
    const newSlots = slots.map(s => (s.id === slotId ? { ...s, player: selected } : s));
    setSelected(null);
    setSlots(newSlots);
    const newLineup = newSlots.filter(s => s.player).map(s => s.player);
    if (newLineup.length >= TOTAL_ROUNDS) {
      if (isCap) {
        // Don't lock the run in yet — let the player review the five and swap
        // a pick before simulating. runCapSim() runs the actual season.
        setPhase('ready');
        return;
      }
      const res = startSim(newLineup, { difficulty });
      if (isDaily) {
        setDailyDone(true);
        try {
          localStorage.setItem(dailyStorageKey, JSON.stringify({ slots: newSlots, result: res }));
        } catch { /* storage full/blocked */ }
      }
    } else {
      setRound(round + 1);
      setCombo(null);
      setPhase('spin');
    }
  };

  // Run the season sim for a finished five and move into the reveal/result.
  const startSim = (lineupArr, opts = {}) => {
    const res = simulateSeason(lineupArr, opts);
    setResult(res);
    setStory(buildSeasonStory(res));
    setSimIdx(0);
    setPhase(revealMode === 'instant' ? 'result' : 'sim');
    return res;
  };

  // Cap Mode: lock in the finished five and run the season.
  const runCapSim = () => {
    const lineupArr = slots.filter(s => s.player).map(s => s.player);
    const budgetLeft = capBudget - lineupArr.reduce((sum, pl) => sum + priceOf(pl), 0);
    startSim(lineupArr, { budgetLeft });
  };

  // Cap Mode: vacate a placed player (his salary is refunded automatically,
  // since spend is derived from the lineup) and drop back into the draft to
  // refill that slot. Bounded by capSwaps so it stays a decision, not an
  // infinite re-roll of the affordable pool.
  const handleSwap = (slotId) => {
    if (!isCap || capSwaps <= 0) return;
    const slot = slots.find(s => s.id === slotId);
    if (!slot || !slot.player) return;
    const newSlots = slots.map(s => (s.id === slotId ? { ...s, player: null } : s));
    setCapSwaps(n => n - 1);
    setSlots(newSlots);
    setRound(newSlots.filter(s => s.player).length + 1);
    setSelected(null);
    setCombo(null);
    setDisplay({ team: '???', decade: "??'s" });
    setPhase('spin');
  };

  const handleRestart = (style = playstyle) => {
    // Random Era hands out a fresh decade each replay.
    if (filterCfg?.random) setActiveParam(randomPick(DECADES));
    setPhase('spin');
    setRound(1);
    setSlots(buildSlots(style));
    setCombo(null);
    setSelected(null);
    setTeamSkips(isCap ? 3 : 1);
    setEraSkips(isCap ? 3 : 1);
    setCapSwaps(isCap ? 2 : 0);
    setResult(null);
    setStory(null);
    setSimIdx(0);
    setCopied(false);
    setShareOpen(false);
    setLbState(null);
    setDisplay({ team: '???', decade: "??'s" });
  };

  // Cap gauntlet: advance to the next (tighter) level, keeping the streak.
  const capNextLevel = () => {
    setCapLevel(l => l + 1);
    handleRestart('balanced');
  };

  // Cap gauntlet: a non-82-0 ends the run — restart from level 1.
  const capRestartGauntlet = () => {
    setCapLevel(1);
    handleRestart('balanced');
  };

  // Leave the setup screen and start drafting with the chosen options.
  const startDraft = () => {
    setMode('standard');
    handleRestart(playstyle);
  };

  const backToModes = () => {
    handleRestart('balanced');
    setPlaystyle('balanced');
    setMode(null);
  };

  // ---- share ----
  const shareText = result
    ? fmt(isDaily ? (g.daily?.shareText || g.shareText) : g.shareText, {
        record: `${result.wins}-${result.losses}`,
        date: dateKey(),
      })
    : '';

  const handlePoster = () => {
    if (!result) return;
    downloadPoster({
      brand: '82-0 CHALLENGE',
      record: `${result.wins}-${result.losses}`,
      grade: result.grade,
      title: g.titles?.[result.title] || '',
      points: result.points,
      lineup: slots.filter(s => s.player).map(s => ({
        pos: s.pos,
        name: s.player.name,
        sub: `${s.player.team} · ${s.player.decade}`,
      })),
      url: 'www.82-0-challenge.com',
      daily: isDaily ? `${g.daily?.badge || 'Daily Challenge'} · ${dateKey()}` : null,
    });
  };

  const hoursToNext = Math.ceil(msToNextUtcMidnight() / 3600000);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${SITE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  // Prefill the leaderboard name from the last submission.
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hoop820_name');
      if (saved) setLbName(saved);
    } catch { /* private mode */ }
  }, []);

  const handleLbSubmit = async () => {
    if (!result || lbState === 'sending' || (lbState && lbState.rank)) return;
    const name = lbName.trim();
    if (name.length < 2) return;
    try { localStorage.setItem('hoop820_name', name); } catch { /* ignore */ }
    setLbState('sending');
    try {
      const data = await submitScore({
        name,
        wins: result.wins,
        losses: result.losses,
        points: result.points,
        grade: result.grade,
        mode: lbTag,
        style: playstyle,
        star: result.best.name,
      });
      saveSubmission({ ...data, name });
      setLbState(data);
    } catch {
      setLbState('error');
    }
  };

  // ================= SETUP =================
  if (!mode) {
    const st = g.styles || {};
    const su = g.setup || {};
    return (
      <div className={styles.game}>
        <div className={styles.setup}>
          <div className={styles.setupHead}>
            <h2 className={styles.setupTitle}>{su.title || 'Build Your Five'}</h2>
            <p className={styles.setupSub}>{su.sub || 'Set your lineup, then draft your all-time team.'}</p>
          </div>

          {/* Playstyle — tabs pick the formation shown on the court below */}
          <div className={styles.cfgGroup}>
            <span className={styles.cfgLabel}>{su.playstyle || 'Playstyle'}</span>
            <div className={styles.styleTabs}>
              {PLAYSTYLE_IDS.map(id => (
                <button
                  key={id}
                  className={`${styles.styleTab} ${playstyle === id ? styles.styleTabActive : ''}`}
                  onClick={() => setPlaystyle(id)}
                >
                  {st[id]?.name || id}
                </button>
              ))}
            </div>
            <div className={styles.stylePreview}>
              <MiniCourt positions={PLAYSTYLES[playstyle]} />
              <p className={styles.styleDesc}>{st[playstyle]?.desc || ''}</p>
            </div>
          </div>

          {/* Show stats */}
          <div className={styles.cfgGroup}>
            <span className={styles.cfgLabel}>{su.showStats || 'Show Stats'}</span>
            <div className={styles.optRow}>
              <button
                className={`${styles.optCard} ${showStats ? styles.optActive : ''}`}
                onClick={() => setShowStats(true)}
              >
                <b>{su.statsOn || 'On'}</b>
                <small>{su.statsOnDesc || 'Full stat lines visible while you draft'}</small>
              </button>
              <button
                className={`${styles.optCard} ${!showStats ? styles.optActive : ''}`}
                onClick={() => setShowStats(false)}
              >
                <b>{su.statsOff || 'Off'}</b>
                <small>{su.statsOffDesc || 'Draft blind — go on instinct alone'}</small>
              </button>
            </div>
          </div>

          {/* Season reveal */}
          <div className={styles.cfgGroup}>
            <span className={styles.cfgLabel}>{su.reveal || 'Season Reveal'}</span>
            <div className={styles.optRow}>
              <button
                className={`${styles.optCard} ${revealMode === 'watch' ? styles.optActive : ''}`}
                onClick={() => setRevealMode('watch')}
              >
                <b>{su.revealWatch || 'Watch'}</b>
                <small>{su.revealWatchDesc || 'Live the season game by game'}</small>
              </button>
              <button
                className={`${styles.optCard} ${revealMode === 'instant' ? styles.optActive : ''}`}
                onClick={() => setRevealMode('instant')}
              >
                <b>{su.revealInstant || 'Instant'}</b>
                <small>{su.revealInstantDesc || 'Skip straight to the final record'}</small>
              </button>
            </div>
          </div>

          <button className={styles.startBtn} onClick={startDraft}>
            {su.start || 'Start Draft →'}
          </button>
        </div>
      </div>
    );
  }

  // ================= SEASON SIM =================
  if (phase === 'sim' && result && story) {
    const sim = g.sim || {};
    const played = story.games.slice(0, simIdx);
    const w = played.filter(x => x.win).length;
    const l = played.length - w;
    const cur = simIdx > 0 ? story.games[simIdx - 1] : null;
    const momentKey = simIdx > 0 ? story.moments[simIdx - 1] : null;
    const MOMENT_FALLBACK = {
      opener: '🏀 Opening night!',
      christmas: '🎄 Christmas Day game',
      win50: '🔥 Win No. 50!',
      closestWin: '😅 Nail-biter — survived!',
      closestLoss: '💔 Heartbreaker at the buzzer',
      finale: '🏁 Season finale',
    };
    return (
      <div className={styles.game}>
        <div className={styles.simCard}>
          <div className={styles.resultLabel}>{sim.title || 'Simulating your season…'}</div>
          <div className={styles.simRecord}>{w}–{l}</div>
          <div className={styles.simGame}>
            {cur ? (
              <>
                <span className={styles.simGameNo}>{fmt(sim.game || 'Game {n}', { n: simIdx })}</span>
                <span className={cur.win ? styles.simWin : styles.simLoss}>
                  {cur.win ? (sim.win || 'W') : (sim.loss || 'L')} {cur.us}–{cur.them}
                </span>
                <span className={styles.simOpp}>vs {cur.opp}</span>
              </>
            ) : (
              <span className={styles.simGameNo}>{sim.tipoff || 'Tip-off…'}</span>
            )}
          </div>
          <div className={styles.simMoment}>
            {momentKey ? (sim[momentKey] || MOMENT_FALLBACK[momentKey]) : ' '}
          </div>
          <div className={styles.simBar}>
            <i style={{ width: `${(simIdx / story.games.length) * 100}%` }} />
          </div>
          <button className={styles.simSkip} onClick={() => setPhase('result')}>
            {sim.skip || 'Skip →'}
          </button>
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
            {isCap
              ? `${cap.variants?.cap || 'Salary Cap'} · ${fmt(cap.level || 'Level {n}', { n: capLevel })} · $${capBudget}`
              : filterCfg
              ? `${cap.variants?.[variant.id] || variant.id}${activeParam ? ` · ${activeParam}` : ''}`
              : isDaily
              ? `🗓️ ${g.daily?.badge || 'Daily Challenge'} · ${dateKey()}`
              : `${g.styles?.[playstyle]?.name || playstyle}${showStats ? '' : ` · ${g.setup?.blindTag || 'Blind'}`}`}
          </div>

          {/* Cap gauntlet outcome */}
          {isCap && (
            result.wins === 82 ? (
              <div className={styles.capLevelUp}>
                <b>🏆 {fmt(cap.cleared || 'Level {n} cleared!', { n: capLevel })}</b>
                <span>
                  {atFloor
                    ? (cap.maxedOut || 'You conquered the tightest budget — legendary.')
                    : fmt(cap.nextBudget || 'Next: Level {n}, only ${b} to spend', { n: capLevel + 1, b: gauntletBudget(capLevel + 1) })}
                </span>
              </div>
            ) : (
              <div className={styles.capRunOver}>
                <b>💀 {cap.runOver || 'Run over'}</b>
                <span>{fmt(cap.reached || 'You cleared {n} level(s) before the budget broke you.', { n: capLevel - 1 })}</span>
              </div>
            )
          )}

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
            {slots.filter(s => s.player).map((s, i) => (
              <div key={s.id} className={styles.recapRow}>
                <span className={`${styles.recapChip} ${styles['chipC' + i]}`}>
                  <b>{initials(s.player.name)}</b>
                  <i>{s.pos}</i>
                </span>
                <span className={styles.recapName}>
                  {s.player.name}
                  <small>{s.player.team} · {s.player.decade}</small>
                </span>
                <span className={styles.recapStats}>
                  <span>{s.player.pts}<i>{g.ppg}</i></span>
                  <span>{s.player.reb}<i>{g.rpg}</i></span>
                  <span>{s.player.ast}<i>{g.apg}</i></span>
                  <span>{s.player.stl}<i>{g.spg}</i></span>
                  <span>{s.player.blk}<i>{g.bpg}</i></span>
                </span>
              </div>
            ))}
          </div>

          {/* Combined team production — makes the record explainable at a glance */}
          <div className={styles.teamTotals}>
            {[['pts', g.ppg], ['reb', g.rpg], ['ast', g.apg], ['stl', g.spg], ['blk', g.bpg]].map(([k, label]) => (
              <span key={k} className={styles.teamTotal}>
                <b>{Math.round(result.totals[k] * 10) / 10}</b>
                <i>{label}</i>
              </span>
            ))}
          </div>

          {isDaily && dailyDone && (
            <p className={styles.dailyComeback}>
              {fmt(g.daily?.comeback, { hours: hoursToNext })}
            </p>
          )}

          {/* Global leaderboard submission */}
          <div className={styles.lbBlock}>
            {lbState && lbState.rank ? (
              <div className={styles.lbDone}>
                <span className={styles.lbRank}>
                  {fmt(lb.rank || 'World #{rank}', { rank: lbState.rank })}
                  <i>{fmt(lb.today || 'Today #{rank}', { rank: lbState.todayRank })}</i>
                </span>
                <a className={styles.lbView} href={`${langPrefix}/leaderboard`}>
                  {lb.view || 'View leaderboard →'}
                </a>
              </div>
            ) : (
              <>
                <div className={styles.lbTitle}>{lb.title || 'Think this five is leaderboard-worthy?'}</div>
                <div className={styles.lbForm}>
                  <input
                    className={styles.lbInput}
                    value={lbName}
                    maxLength={14}
                    placeholder={lb.name || 'Your name'}
                    onChange={ev => setLbName(ev.target.value)}
                  />
                  <button
                    className={styles.lbBtn}
                    onClick={handleLbSubmit}
                    disabled={lbState === 'sending' || lbName.trim().length < 2}
                  >
                    {lbState === 'sending' ? (lb.sending || 'Submitting…') : (lb.submit || 'Submit to Global Leaderboard')}
                  </button>
                </div>
                {lbState === 'error' && (
                  <p className={styles.lbError}>{lb.error || 'Couldn’t submit — try again in a few seconds.'}</p>
                )}
              </>
            )}
          </div>

          <a
            className={styles.storyCta}
            href={buildStoryUrl(result, slots, story, playstyle, routeParams?.lang)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {g.storyCta || '📖 Turn this team into a storybook →'}
          </a>

          <div className={styles.resultActions}>
            {isCap ? (
              result.wins === 82 && !atFloor ? (
                <button className={styles.primaryBtn} onClick={capNextLevel}>{cap.nextLevel || 'Next Level →'}</button>
              ) : (
                <button className={styles.primaryBtn} onClick={capRestartGauntlet}>{cap.newRun || 'New Run'}</button>
              )
            ) : !isDaily ? (
              <button className={styles.primaryBtn} onClick={handleRestart}>{g.playAgain}</button>
            ) : null}
            <button
              className={isDaily ? styles.primaryBtn : styles.secondaryBtn}
              onClick={() => setShareOpen(true)}
            >
              {g.shareModal?.open || 'Share'}
            </button>
            <button className={styles.secondaryBtn} onClick={handlePoster}>
              {g.poster || 'Download Poster'}
            </button>
            <button className={styles.secondaryBtn} onClick={handleCopy}>
              {copied ? g.copied : g.copyResult}
            </button>
            {!filterCfg && (
              <button className={styles.secondaryBtn} onClick={backToModes}>{g.switchMode}</button>
            )}
          </div>

          <ShareModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            sh={g.shareModal || {}}
            shareText={shareText}
            payload={{
              wins: result.wins,
              losses: result.losses,
              points: result.points,
              grade: result.grade,
              mode: lbTag,
              style: playstyle,
              lineup: slots.filter(s => s.player).map(s => ({
                pos: s.pos,
                name: s.player.name,
                team: s.player.team,
                decade: s.player.decade,
              })),
            }}
          />
        </div>
      </div>
    );
  }

  // ================= DRAFT =================
  return (
    <div className={styles.game}>
      <div className={styles.draftHeader}>
        <span className={styles.roundBadge}>{fmt(g.roundOf, { round, total: TOTAL_ROUNDS })}</span>
        {phase === 'pick' && !isDaily && (
          <div className={styles.skips}>
            <button className={styles.skipBtn} onClick={handleTeamSkip} disabled={teamSkips <= 0}>
              🔁 {g.rerollTeam} ({teamSkips})
            </button>
            <button className={styles.skipBtn} onClick={handleEraSkip} disabled={eraSkips <= 0}>
              🔁 {g.rerollEra} ({eraSkips})
            </button>
          </div>
        )}
        {isCap && phase !== 'sim' && phase !== 'result' && (
          <span className={styles.variantTag}>🔄 {fmt(cap.swaps || 'Swaps ({n})', { n: capSwaps })}</span>
        )}
        {phase !== 'result' && isDaily && (
          <span className={styles.dailyTag}>🗓️ {g.daily?.badge || 'Daily Challenge'} · {g.daily?.noSkips}</span>
        )}
        {filterCfg && !isDaily && (
          <span className={styles.variantTag}>
            🎯 {cap.variants?.[variant.id] || variant.id}{activeParam ? ` · ${activeParam}` : ''}
          </span>
        )}
      </div>

      {/* Cap Mode budget meter — drops as you roll-and-pick your five */}
      {isCap && (
        <div className={styles.capBar}>
          <div className={styles.capBudget}>
            <span className={styles.capBudgetLabel}>
              {cap.budget || 'Salary Cap'} · {fmt(cap.level || 'Level {n}', { n: capLevel })}
            </span>
            <span className={styles.capBudgetVal}>
              <b>{capLeft}</b> / {capBudget} {cap.left || 'left'}
            </span>
          </div>
          <div className={styles.capMeter}>
            <i style={{ width: `${Math.min(100, (capSpent / capBudget) * 100)}%` }} />
          </div>
        </div>
      )}

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
                      className={`${styles.playerRow} ${isCap ? styles.capRow : ''} ${selected?.id === p.id ? styles.playerSelected : ''} ${!placeable ? styles.playerBlocked : ''}`}
                      onClick={() => placeable && setSelected(p)}
                      disabled={!placeable}
                    >
                      {isCap && <span className={styles.capPrice}>${priceOf(p)}</span>}
                      <span className={styles.playerInfo}>
                        <b>{p.name}</b>
                        <span className={styles.playerPos}>{p.positions.join(' · ')}</span>
                        <small>{p.team} · {p.decade}</small>
                      </span>
                      {showStats && (
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
            <div className={styles.spinHint}>
              {isCap && phase === 'ready'
                ? (cap.reviewHint || 'Your five is set. Simulate the season, or tap a player to swap him out.')
                : g.spinHint}
            </div>
          )}
        </div>

        {/* Court */}
        <div className={styles.courtPanel}>
          <div className={styles.court}>
            <svg className={styles.courtLines} viewBox="0 0 100 90" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
              {/* half-court line + center circle (bottom) */}
              <line x1="1" y1="89" x2="99" y2="89" />
              <path d="M40 89 A10 10 0 0 1 60 89" />
              {/* three-point line: corners + top arc */}
              <path d="M9 1 L9 15 A41 41 0 0 0 91 15 L91 1" />
              {/* paint / key */}
              <rect x="38" y="1" width="24" height="34" />
              {/* free-throw circle */}
              <circle cx="50" cy="35" r="8" />
              {/* backboard + rim */}
              <line className={styles.rim} x1="43" y1="6" x2="57" y2="6" />
              <circle className={styles.rim} cx="50" cy="9" r="2" />
            </svg>
            {slots.map((s, i) => {
              const p = s.player;
              const eligible = selected && !p && selected.positions.includes(s.pos);
              // A placed player can be swapped out in Cap Mode (when no pick is
              // mid-placement and swaps remain) — tapping his slot vacates it.
              const swappable = !selected && p && isCap && capSwaps > 0 && phase !== 'sim' && phase !== 'result';
              return (
                <button
                  key={s.id}
                  className={`${styles.courtSlot} ${styles['courtSpot' + i]} ${p ? `${styles.slotFilled} ${styles['slotC' + i]}` : ''} ${eligible ? styles.slotEligible : ''} ${swappable ? styles.slotSwappable : ''}`}
                  onClick={() => (swappable ? handleSwap(s.id) : handlePlace(s.id))}
                  title={swappable ? (cap.swapHint || 'Tap to swap this player out') : undefined}
                >
                  {p ? (
                    <>
                      <b>{initials(p.name)}</b>
                      <i>{s.pos}</i>
                    </>
                  ) : (
                    <span>{s.pos}</span>
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
          {isCap && phase === 'ready' && !selected && (
            <div className={styles.readyBar}>
              <button className={styles.primaryBtn} onClick={runCapSim}>
                {cap.simulate || 'Simulate Season →'}
              </button>
              {capSwaps > 0 && (
                <small>{fmt(cap.swapReady || 'Or tap a player to swap him out — {n} swap(s) left', { n: capSwaps })}</small>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
