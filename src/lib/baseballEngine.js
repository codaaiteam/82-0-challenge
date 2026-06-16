// 23-0 AFL engine — classic-18 structure, rating-weighted aggregation with a
// non-linear 23-game win-projection curve. Chase the perfect season no VFL/AFL
// side has ever produced.

import b60 from '@/data/baseball/1960s.json';
import b70 from '@/data/baseball/1970s.json';
import b80 from '@/data/baseball/1980s.json';
import b90 from '@/data/baseball/1990s.json';
import b00 from '@/data/baseball/2000s.json';
import b10 from '@/data/baseball/2010s.json';
import b20 from '@/data/baseball/2020s.json';

export const AFL_PLAYERS = [...b60, ...b70, ...b80, ...b90, ...b00, ...b10, ...b20];

export const AFL_ERAS = ['1960s','1970s','1980s','1990s','2000s','2010s','2020s'];
export const AFL_CLUBS = [...new Set(AFL_PLAYERS.map(p => p.club))];

export const SEASON_GAMES = 162;

// ---- Structure ----
// One classic AFL 18: back six, midfield six (centre line + followers),
// forward six. Coordinates are percentages on a VERTICAL oval — attack at
// the top (small y), full back at the bottom.

export const FORMATIONS = {
  classic: {
    name: 'Diamond 9',
    slots: [
      { label: 'LF', bucket: 'OF', x: 22, y: 14 },
      { label: 'CF', bucket: 'OF', x: 50, y: 8 },
      { label: 'RF', bucket: 'OF', x: 78, y: 14 },
      { label: 'SS', bucket: 'IF', x: 38, y: 42 },
      { label: '2B', bucket: 'IF', x: 62, y: 42 },
      { label: 'P',  bucket: 'P',  x: 50, y: 56 },
      { label: '3B', bucket: 'IF', x: 20, y: 60 },
      { label: '1B', bucket: 'IF', x: 80, y: 60 },
      { label: 'C',  bucket: 'IF', x: 50, y: 90 },
    ],
  },
};

export const FORMATION_IDS = Object.keys(FORMATIONS);

export function buildSlots(formationId) {
  return (FORMATIONS[formationId] || FORMATIONS.classic).slots.map((s, i) => ({
    id: `${s.bucket}${i}`,
    label: s.label,
    bucket: s.bucket,
    x: s.x,
    y: s.y,
  }));
}

export function aflSlotAccepts(bucket, pos) {
  return bucket === pos;
}

// ---- Spinning combos (club × era) ----

export function aflRandomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function aflPlayersFor(club, era, pickedIds) {
  return AFL_PLAYERS.filter(
    p => p.club === club && p.era === era && !pickedIds.includes(p.id)
  );
}

export function aflComboPool(eraFilter) {
  const keys = [...new Set(
    AFL_PLAYERS
      .filter(p => !eraFilter || p.era === eraFilter)
      .map(p => `${p.club}|${p.era}`)
  )];
  return keys.map(k => {
    const [team, era] = k.split('|');
    return { team, era };
  });
}

// How many of this combo's remaining players could actually be placed into
// the open slots (respecting per-bucket capacity). Each spin asks the user
// for two picks, so draftability is capacity-aware.
function comboCapacity(combo, pickedIds, openSlots) {
  const cap = {};
  openSlots.forEach(s => { cap[s.bucket] = (cap[s.bucket] || 0) + 1; });
  let n = 0;
  aflPlayersFor(combo.team, combo.era, pickedIds).forEach(p => {
    if (cap[p.pos] > 0) { cap[p.pos]--; n++; }
  });
  return n;
}

export function aflDraftableCombos(pickedIds, openSlots, eraFilter, exclude, need = 1) {
  return aflComboPool(eraFilter).filter(c => {
    if (exclude && c.team === exclude.team && c.era === exclude.era) return false;
    return comboCapacity(c, pickedIds, openSlots) >= need;
  });
}

export function aflSpinCombo(pickedIds, openSlots, eraFilter, exclude, mustBucket) {
  const need = Math.min(2, openSlots.length);
  const covers = c =>
    !mustBucket ||
    aflPlayersFor(c.team, c.era, pickedIds).some(p => p.pos === mustBucket);
  // Prefer combos that can supply the full two picks (and the targeted
  // bucket in position-first mode), then loosen tier by tier.
  const tiers = [
    () => aflDraftableCombos(pickedIds, openSlots, eraFilter, exclude, need).filter(covers),
    () => aflDraftableCombos(pickedIds, openSlots, eraFilter, exclude, 1).filter(covers),
    () => aflDraftableCombos(pickedIds, openSlots, null, exclude, 1).filter(covers),
    () => aflDraftableCombos(pickedIds, openSlots, null, exclude, 1),
    () => aflComboPool(eraFilter),
    () => aflComboPool(null),
  ];
  for (const tier of tiers) {
    const pool = tier();
    if (pool.length) return aflRandomPick(pool);
  }
  return null;
}

export function aflReroll(current, pickedIds, openSlots, eraFilter, mustBucket) {
  return aflSpinCombo(pickedIds, openSlots, eraFilter, current, mustBucket);
}

// ---- 23-game season simulation ----

// Midfield is king in the AFL — Brownlow nights are a parade of mids — and
// key forwards decide scoreboards. Weights are normalised across the 18.
const BUCKET_W = { P: 1.35, IF: 1.1, OF: 1.1 };

// The 17 clubs your side shares the league with, tiered by strength.
// Mean strength ≈ 0.75 — the anchor every probability below leans on.
export const AFL_OPPONENTS = [
  { name: 'Dodgers', str: 0.91 },
  { name: 'Yankees', str: 0.89 },
  { name: 'Astros', str: 0.87 },
  { name: 'Braves', str: 0.86 },
  { name: 'Phillies', str: 0.82 },
  { name: 'Orioles', str: 0.80 },
  { name: 'Rangers', str: 0.78 },
  { name: 'Padres', str: 0.77 },
  { name: 'Mariners', str: 0.75 },
  { name: 'Blue Jays', str: 0.73 },
  { name: 'Guardians', str: 0.70 },
  { name: 'Brewers', str: 0.68 },
  { name: 'D-backs', str: 0.67 },
  { name: 'Cubs', str: 0.65 },
  { name: 'Twins', str: 0.64 },
  { name: 'Reds', str: 0.61 },
  { name: 'Red Sox', str: 0.58 },
];

const OPP_MEAN = 0.75;

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function samplePoisson(lambda) {
  const L = Math.exp(-Math.max(0.05, lambda));
  let k = 0;
  let p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return k - 1;
}

// Aggregate squad quality. S drives the 23·S³ projection curve.
export function aflSquadScore(filled) {
  const totalW = filled.reduce((sum, s) => sum + BUCKET_W[s.bucket], 0);

  let S = 0;
  let minNorm = 1;
  let worst = filled[0];
  const lines = { P: [], IF: [], OF: [] };

  filled.forEach(s => {
    const norm = Math.min(1, s.player.rating / 99);
    S += (BUCKET_W[s.bucket] / totalW) * norm;
    lines[s.bucket].push(norm);
    if (norm < minNorm) { minNorm = norm; worst = s; }
  });

  const avg = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0.8);

  return {
    S,
    minNorm,
    worst,
    attack: avg(lines.OF),
    midfield: avg(lines.IF),
    defence: avg(lines.P),
  };
}

// Baseline per-game win rate, anchored to the 23·S³ curve.
function baseWinRate({ S, midfield, minNorm }) {
  let wr = Math.pow(S, 3);
  if (midfield < 0.78) wr -= 0.07; // an outgunned midfield bleeds clearances
  if (minNorm < 0.65) wr -= 0.06;  // one passenger drags the whole 18
  return clamp(wr, 0.08, 0.92);
}

// AFL draws are genuinely rare — a handful per decade.
function matchProbs(wr, oppStr, home) {
  const pWin = clamp(wr + (OPP_MEAN - oppStr) * 1.15 + (home ? 0.04 : -0.03), 0.04, 0.965);
  // Baseball games are decided every time — no ties.
  return { pWin, pDraw: 0 };
}

// Defenders top out around 89-91 in this pool, so a flawless 18 lands near
// S ≈ 0.934 — the elite gate sits just under that, not at the soccer 0.94.
function isElite({ S, midfield, minNorm }) {
  return S >= 0.93 && midfield >= 0.90 && minNorm >= 0.8;
}

// Expected ladder points (win 4, draw 2) integrated over a 23-game fixture:
// every club once plus six return games, averaged over venue.
function expectedPoints(score) {
  const wr = baseWinRate(score);
  let perGame = 0;
  AFL_OPPONENTS.forEach(o => {
    [true, false].forEach(home => {
      const { pWin, pDraw } = matchProbs(wr, o.str, home);
      perGame += 4 * pWin + 2 * pDraw;
    });
  });
  perGame /= 34;
  return Math.round(perGame * SEASON_GAMES);
}

function projectFinish(expPts) {
  if (expPts >= 75) return 1;
  if (expPts >= 71) return 2;
  if (expPts >= 67) return 3;
  if (expPts >= 62) return 4;
  if (expPts >= 58) return 5;
  if (expPts >= 54) return 6;
  if (expPts >= 50) return 7;
  if (expPts >= 46) return 8;
  if (expPts >= 42) return 10;
  if (expPts >= 38) return 12;
  if (expPts >= 32) return 14;
  if (expPts >= 26) return 16;
  return 18;
}

function logistic(x) {
  return 1 / (1 + Math.exp(-x));
}

function pct(v, min = 0.1, max = 99.9) {
  return Math.round(clamp(v * 100, min, max) * 10) / 10;
}

// What the bookies make of the 18 before the first bounce.
export function aflPreSeasonOdds(filled) {
  const score = aflSquadScore(filled);
  const expPts = expectedPoints(score);
  const wr = baseWinRate(score);

  let meanPWin = 0;
  AFL_OPPONENTS.forEach(o => {
    [true, false].forEach(home => {
      meanPWin += matchProbs(wr, o.str, home).pWin;
    });
  });
  meanPWin /= 34;
  const perfect = Math.pow(meanPWin, SEASON_GAMES) * 100;

  return {
    expPts,
    projectedFinish: projectFinish(expPts),
    winLeague: pct(logistic((expPts - 73) / 5)),     // minor premiership
    top4: pct(logistic((expPts - 62) / 6)),
    top8: pct(logistic((expPts - 47) / 6)),          // play finals
    spoon: pct(logistic(-(expPts - 24) / 4.5)),      // wooden spoon
    perfect: perfect >= 0.05 ? Math.round(perfect * 10) / 10 : 0,
  };
}

// Pick a goal involvement weighted by position and rating.
function weightedPlayer(filled, weights, excludeId) {
  const pool = filled
    .filter(s => weights[s.bucket] > 0 && s.player.id !== excludeId)
    .map(s => ({ s, w: weights[s.bucket] * Math.pow(s.player.rating / 99, 2) }));
  if (!pool.length) return null;
  let roll = Math.random() * pool.reduce((a, p) => a + p.w, 0);
  for (const p of pool) {
    roll -= p.w;
    if (roll <= 0) return p.s;
  }
  return pool[pool.length - 1].s;
}

const SCORER_W = { P: 0.1, IF: 1.0, OF: 1.4 };
const ASSIST_W = { P: 0.3, IF: 1.6, OF: 1.0 };

// AFL game clock for display: 1–120 "minutes" across four quarters.
const GAME_MINS = 120;

function buildScorers(filled, goals, stats) {
  const out = [];
  for (let i = 0; i < goals; i++) {
    const slot = weightedPlayer(filled, SCORER_W);
    if (!slot) break;
    stats[slot.player.id].goals++;
    out.push({ name: slot.player.name, min: randomInt(1, GAME_MINS - 2) });
    if (Math.random() < 0.55) {
      const assist = weightedPlayer(filled, ASSIST_W, slot.player.id);
      if (assist) stats[assist.player.id].assists++;
    }
  }
  return out.sort((a, b) => a.min - b.min);
}

// Split a points total into goals (6) and behinds (1): P = 6g + b.
function splitScore(points) {
  let b = (points % 6) + 6 * randomInt(0, 2);
  if (b > points) b = points % 6;
  return { g: (points - b) / 6, b };
}

// Full game-by-game season. Keeps the legacy fields (wins/losses/points/
// grade/title/weakness/best) so the poster and share text don't change.
export function aflSimulateSeason(filled) {
  const score = aflSquadScore(filled);
  const { S, minNorm, worst, attack, midfield, defence } = score;
  const wr = baseWinRate(score);

  // Perfection keeps its odds: an elite, gap-free 18 still converts at 65%.
  const destiny = isElite(score) && Math.random() > 0.35;

  const stats = {};
  filled.forEach(s => {
    stats[s.player.id] = {
      name: s.player.name,
      label: s.label,
      bucket: s.bucket,
      rating: s.player.rating,
      goals: 0,
      assists: 0,
      cs: 0, // lockdowns — games conceding under 60
    };
  });

  // Fixture list: cycle the opponent pool to fill the full SEASON_GAMES
  // schedule (162 for baseball), then shuffle. The pool is smaller than the
  // season, so opponents repeat — like a real MLB division/league slate.
  const fixtures = [];
  for (let i = 0; i < SEASON_GAMES; i++) {
    const o = AFL_OPPONENTS[i % AFL_OPPONENTS.length];
    fixtures.push({ opp: o.name, str: o.str, home: Math.random() < 0.5 });
  }
  for (let i = fixtures.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fixtures[i], fixtures[j]] = [fixtures[j], fixtures[i]];
  }

  const matches = [];
  let wins = 0, draws = 0, losses = 0, pfTotal = 0, paTotal = 0;

  fixtures.forEach((fx, idx) => {
    const { pWin, pDraw } = matchProbs(wr, fx.str, fx.home);
    let res;
    if (destiny) {
      res = 'W';
    } else {
      const roll = Math.random();
      res = roll < pWin ? 'W' : roll < pWin + pDraw ? 'D' : 'L';
    }

    // Sample runs for each side, then bend to the decided result. Baseball
    // scores are small (no "behinds"), so runs live in g/og with b/ob at 0.
    const lamFor = Math.max(1.6, 4.6 + attack * 3.5 - (fx.str - OPP_MEAN) * 3);
    const lamAgainst = Math.max(1.2, 4.2 + (fx.str - OPP_MEAN) * 4.5 - (defence - 0.8) * 3);
    let g = samplePoisson(lamFor);
    let og = samplePoisson(lamAgainst);
    let b = 0, ob = 0;
    let pts = g, opts = og;

    if (res === 'W' && pts <= opts) {
      g = opts + 1 + (Math.random() < 0.4 ? 1 : 0); pts = g;
    } else if (res === 'L' && opts <= pts) {
      og = pts + 1 + (Math.random() < 0.4 ? 1 : 0); opts = og;
    }

    pfTotal += pts;
    paTotal += opts;
    if (res === 'W') wins++;
    else if (res === 'D') draws++;
    else losses++;

    // Shutout — the staff held the opponent scoreless.
    if (opts === 0) {
      filled.forEach(s => {
        if (s.bucket === 'P') stats[s.player.id].cs++;
      });
    }

    matches.push({
      wk: idx + 1, opp: fx.opp, home: fx.home,
      g, b, pts, og, ob, opts,
      gf: pts, ga: opts, res,
      scorers: buildScorers(filled, g, stats),
    });
  });

  const leaguePts = wins * 4 + draws * 2;
  const percentage = Math.round((pfTotal / Math.max(1, paTotal)) * 1000) / 10;

  // The other 17 finish on strength plus a season of noise.
  const rivals = AFL_OPPONENTS.map(o => ({
    name: o.name,
    pts: clamp(Math.round(155 * o.str - 69) + randomInt(-6, 6), 4, 88),
    pct: Math.round((100 + (o.str - OPP_MEAN) * 180 + randomInt(-8, 8)) * 10) / 10,
    you: false,
  }));
  const table = [...rivals, { name: 'YOU', pts: leaguePts, pct: percentage, you: true }]
    .sort((a, b) => b.pts - a.pts || b.pct - a.pct);
  const position = table.findIndex(r => r.you) + 1;

  const expPts = expectedPoints(score);
  const projectedFinish = projectFinish(expPts);
  const verdict = position < projectedFinish ? 'over' : position > projectedFinish ? 'under' : 'on';

  // Season awards. No keeper in this sport — `glove` stays null so the
  // result screen simply doesn't render that card.
  const all = Object.values(stats);
  const boot = all.reduce((a, b2) => (b2.goals > a.goals ? b2 : a));
  const playmaker = all.reduce((a, b2) => (b2.assists > a.assists ? b2 : a));
  const potsScore = p => p.goals * 3 + p.assists * 2.5 + p.cs * 1.5 + p.rating * 0.06;
  const pots = all.reduce((a, b2) => (potsScore(b2) > potsScore(a) ? b2 : a));

  const cleanSheets = matches.filter(m => m.opts < 60).length; // lockdowns
  let bestStreak = 0, run = 0;
  matches.forEach(m => {
    run = m.res === 'W' ? run + 1 : 0;
    if (run > bestStreak) bestStreak = run;
  });
  const biggestWin = matches.reduce((a, m) => (m.pts - m.opts > (a ? a.pts - a.opts : -999) ? m : a), null);
  const highScoring = matches.reduce((a, m) => (m.pts + m.opts > (a ? a.pts + a.opts : -1) ? m : a), null);

  // Legacy fields.
  const points = Math.round(S * 1000) / 10;

  let grade;
  if (points >= 93) grade = 'S+';
  else if (points >= 90) grade = 'S';
  else if (points >= 86) grade = 'A';
  else if (points >= 78) grade = 'B';
  else if (points >= 65) grade = 'C';
  else grade = 'D';

  let weakness = 'none';
  if (minNorm < 0.8) {
    weakness = {
      P: 'weakDefense',
      IF: 'weakMidfield',
      OF: 'weakAttack',
    }[worst.bucket];
  }

  const best = filled.reduce((b2, s) => (s.player.rating > b2.player.rating ? s : b2)).player;

  let title;
  if (wins === SEASON_GAMES) title = 'perfect';
  else if (losses === 0) title = 'invincible';
  else if (position === 1) title = 'champions';
  else if (position === 2) title = 'favorite';
  else if (position <= 4) title = 'contender';
  else if (position <= 8) title = 'european'; // finals football
  else title = 'playoff';

  return {
    wins, losses, points, grade, title, weakness, best,
    draws, leaguePts, gf: pfTotal, ga: paTotal, percentage,
    position, projectedFinish, verdict,
    matches, table,
    awards: { boot, playmaker, glove: null, pots },
    playerStats: all,
    cleanSheets, bestStreak, biggestWin, highScoring,
  };
}
