// 82-0 Challenge engine v2 — real-stat aggregation with era adjustment
// and a non-linear win-projection curve.

import d60 from '@/data/players/1960s.json';
import d70 from '@/data/players/1970s.json';
import d80 from '@/data/players/1980s.json';
import d90 from '@/data/players/1990s.json';
import d00 from '@/data/players/2000s.json';
import d10 from '@/data/players/2010s.json';
import d20 from '@/data/players/2020s.json';

export const PLAYERS = [...d60, ...d70, ...d80, ...d90, ...d00, ...d10, ...d20];

export const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'];

// Playstyles are the basketball answer to football formations: each is a
// 5-slot position template. The simulation itself is unchanged — the strategic
// trade-off emerges from the roster a template forces you to build (e.g. small
// ball has no center, so rim protection and rebounding suffer naturally).
export const PLAYSTYLES = {
  balanced: ['PG', 'SG', 'SF', 'PF', 'C'],
  smallball: ['PG', 'SG', 'SF', 'SF', 'PF'],
  twintowers: ['PG', 'SG', 'SF', 'C', 'C'],
  rungun: ['PG', 'PG', 'SG', 'SF', 'PF'],
};

export const PLAYSTYLE_IDS = Object.keys(PLAYSTYLES);

// Fresh slot list for a playstyle. Each slot gets a stable id so duplicate
// positions (two C's, two PG's) stay distinct on the court.
export function buildSlots(styleId) {
  const tmpl = PLAYSTYLES[styleId] || PLAYSTYLES.balanced;
  return tmpl.map((pos, i) => ({ id: i, pos, player: null }));
}

export const DECADES = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

// All (team, decade) combos that exist in the player pool.
export const COMBOS = [...new Set(PLAYERS.map(p => `${p.team}|${p.decade}`))].map(key => {
  const [team, decade] = key.split('|');
  return { team, decade };
});

export const ALL_TEAMS = [...new Set(PLAYERS.map(p => p.team))];

// Different decades have different statistical environments — a 30 PPG season
// in the pace-and-space-free 1960s is not a 30 PPG season in the 1990s.
// Factors normalize raw averages toward a 1990s baseline.
const ERA_ADJ = {
  '1960s': { pts: 0.80, reb: 0.62, ast: 0.85, stl: 0.90, blk: 0.90 },
  '1970s': { pts: 0.88, reb: 0.78, ast: 0.90, stl: 0.95, blk: 0.95 },
  '1980s': { pts: 0.94, reb: 0.92, ast: 0.95, stl: 1.00, blk: 1.00 },
  '1990s': { pts: 1.00, reb: 1.00, ast: 1.00, stl: 1.00, blk: 1.00 },
  '2000s': { pts: 1.04, reb: 1.00, ast: 1.00, stl: 1.05, blk: 1.00 },
  '2010s': { pts: 1.00, reb: 0.98, ast: 0.98, stl: 1.05, blk: 1.05 },
  '2020s': { pts: 0.94, reb: 0.96, ast: 0.96, stl: 1.10, blk: 1.10 },
};

// Adjusted team totals that mark a "perfect" category. Hitting every one of
// these simultaneously is what 82-0 demands.
const BENCH = { pts: 122, reb: 44, ast: 27, stl: 7.2, blk: 4.6 };

const CATS = ['pts', 'reb', 'ast', 'stl', 'blk'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function adjustedStats(player) {
  const adj = ERA_ADJ[player.decade] || ERA_ADJ['1990s'];
  return {
    pts: player.pts * adj.pts,
    reb: player.reb * adj.reb,
    ast: player.ast * adj.ast,
    stl: player.stl * adj.stl,
    blk: player.blk * adj.blk,
  };
}

// ---- Salary Cap pricing ----
// Cap Mode gives every player a price so a five must be built under a fixed
// budget. Price derives from the same production score the engine uses to crown
// the "best pick", normalized across the whole pool onto a 5–32 scale (a slight
// <1 exponent keeps mid-tier players off the floor). CAP_BUDGET is generous
// enough for 2–3 stars plus role players, never a five-superstar lineup — that
// trade-off is the whole game.
export const CAP_BUDGET = 100;

// Cap Mode gauntlet: the budget starts loose and tightens every time you clear
// an 82-0. Each cleared level drops it by CAP_STEP down to CAP_FLOOR (below
// which a five can't be afforded). A non-82-0 ends the run.
export const CAP_GAUNTLET_START = 120;
export const CAP_STEP = 10;
export const CAP_FLOOR = 30;

export function gauntletBudget(level) {
  return Math.max(CAP_FLOOR, CAP_GAUNTLET_START - (level - 1) * CAP_STEP);
}

function productionScore(p) {
  const a = adjustedStats(p);
  return a.pts + a.reb * 1.1 + a.ast * 1.4 + a.stl * 4 + a.blk * 4;
}

const _scores = PLAYERS.map(productionScore);
const _scoreMin = Math.min(..._scores);
const _scoreMax = Math.max(..._scores);

export const PRICE_BY_ID = Object.fromEntries(
  PLAYERS.map(p => {
    const norm = (productionScore(p) - _scoreMin) / (_scoreMax - _scoreMin);
    return [p.id, Math.round(5 + 27 * Math.pow(norm, 0.85))];
  })
);

export function priceOf(player) {
  return PRICE_BY_ID[player.id] || 5;
}

// Cheapest / priciest price in the pool — bounds the Cap Mode price slider.
export const MIN_PRICE = Math.min(...Object.values(PRICE_BY_ID));
export const MAX_PRICE = Math.max(...Object.values(PRICE_BY_ID));

// "MVP" tier — the priciest stars, excluded by the No MVPs filter. Top players
// by production score; the price ≥ 24 cutoff lands ~30 all-time greats.
export const MVP_IDS = new Set(
  PLAYERS.filter(p => priceOf(p) >= 24).map(p => p.id)
);

// ---- Draft helpers ----
// `filter` is an optional player predicate the Challenge Filters use to shrink
// the draftable pool (one franchise, one decade, no MVPs …). It defaults to
// "everyone", so the classic spin flow is unchanged.
const ALL_PLAYERS = () => true;

export function playersFor(team, decade, pickedIds, filter = ALL_PLAYERS) {
  return PLAYERS.filter(
    p => p.team === team && p.decade === decade && !pickedIds.includes(p.id) && filter(p)
  );
}

// A combo is draftable if at least one un-picked player fits an open slot.
export function comboIsDraftable(combo, pickedIds, openSlots, filter = ALL_PLAYERS) {
  return playersFor(combo.team, combo.decade, pickedIds, filter).some(p =>
    p.positions.some(pos => openSlots.includes(pos))
  );
}

export function draftableCombos(pickedIds, openSlots, exclude, filter = ALL_PLAYERS) {
  return COMBOS.filter(c => {
    if (exclude && c.team === exclude.team && c.decade === exclude.decade) return false;
    return comboIsDraftable(c, pickedIds, openSlots, filter);
  });
}

// Random combo for a new round (or a full reroll).
export function spinCombo(pickedIds, openSlots, exclude, filter = ALL_PLAYERS) {
  const pool = draftableCombos(pickedIds, openSlots, exclude, filter);
  return randomPick(pool.length ? pool : COMBOS);
}

// Deterministic daily sequence: pre-draw N distinct combos from the full
// list using a seeded RNG, so every player gets the same spins.
export function dailyCombos(rng, count = 5) {
  const seq = [];
  const used = new Set();
  let guard = 0;
  while (seq.length < count && guard++ < 500) {
    const c = COMBOS[Math.floor(rng() * COMBOS.length)];
    const key = `${c.team}|${c.decade}`;
    if (used.has(key)) continue;
    used.add(key);
    seq.push(c);
  }
  return seq;
}

// Team skip: new random team, same decade if possible.
export function rerollTeam(current, pickedIds, openSlots, filter = ALL_PLAYERS) {
  const sameDecade = draftableCombos(pickedIds, openSlots, current, filter).filter(
    c => c.decade === current.decade && c.team !== current.team
  );
  if (sameDecade.length) return randomPick(sameDecade);
  return spinCombo(pickedIds, openSlots, current, filter);
}

// Era skip: new random decade, same team if possible.
export function rerollEra(current, pickedIds, openSlots, filter = ALL_PLAYERS) {
  const sameTeam = draftableCombos(pickedIds, openSlots, current, filter).filter(
    c => c.team === current.team && c.decade !== current.decade
  );
  if (sameTeam.length) return randomPick(sameTeam);
  const otherDecade = draftableCombos(pickedIds, openSlots, current, filter).filter(
    c => c.decade !== current.decade
  );
  if (otherDecade.length) return randomPick(otherDecade);
  return spinCombo(pickedIds, openSlots, current, filter);
}

// ---- Season simulation ----

export function simulateSeason(lineup, opts = {}) {
  // lineup: array of 5 players. opts:
  //   difficulty — win-curve exponent multiplier (>1 = Hard Mode, fewer wins
  //                for the same roster + a stingier 82-0 luck gate).
  //   budgetLeft — unspent Cap Mode budget; rewards efficient builds with a
  //                small team-rating bonus so two perfect seasons break the
  //                tie in favor of the leaner cap sheet.
  const difficulty = opts.difficulty || 1;
  const totals = { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0 };
  lineup.forEach(p => {
    const a = adjustedStats(p);
    CATS.forEach(c => { totals[c] += a[c]; });
  });

  const ratios = {};
  CATS.forEach(c => { ratios[c] = Math.min(1, totals[c] / BENCH[c]); });

  // Weighted strength — scoring leads, but a deficiency anywhere drags the curve.
  const S =
    ratios.pts * 0.30 +
    ratios.reb * 0.20 +
    ratios.ast * 0.20 +
    ratios.stl * 0.15 +
    ratios.blk * 0.15;

  const minRatio = Math.min(...CATS.map(c => ratios[c]));
  const worstCat = CATS.reduce((w, c) => (ratios[c] < ratios[w] ? c : w), CATS[0]);

  // Uncapped strength for the leaderboard rating. S (above) caps every
  // category at 1.0 for the win curve, so elite rosters all hit 100 and tie.
  // rawS keeps rewarding production past the benchmark, so the team rating
  // separates the best-of-the-best (and can exceed 100, like the original).
  const rawS =
    (totals.pts / BENCH.pts) * 0.30 +
    (totals.reb / BENCH.reb) * 0.20 +
    (totals.ast / BENCH.ast) * 0.20 +
    (totals.stl / BENCH.stl) * 0.15 +
    (totals.blk / BENCH.blk) * 0.15;

  // Non-linear curve: each additional win gets harder to earn. Hard Mode
  // steepens the exponent so even strong rosters drop a few more.
  let wins = Math.round(82 * Math.pow(S, 2.6 * difficulty)) + randomInt(-2, 2);

  // Category gates — one glaring hole kills a perfect season.
  if (minRatio < 0.6) wins = Math.min(wins, 68);
  else if (minRatio < 0.75) wins = Math.min(wins, 76);

  wins = Math.max(8, Math.min(81, wins));

  // The threshold for a shot at 82-0. The classic rule is "max every category"
  // (every ratio >= 0.85), but a genuinely dominant roster should be able to
  // buy down a near-miss in one category with surplus elsewhere — scoring 129
  // when the benchmark is 122 ought to count for something. S caps each
  // category at 1.0 and throws that overflow away; rawS keeps it, so the gap
  // (rawS - S) is a "compensation pool". The weakest category may dip as low
  // as COMP_FLOOR if the pool covers its weighted shortfall below 0.85 with
  // room to spare (×2). Below COMP_FLOOR a hole is always fatal, so lopsided
  // rosters still can't sneak a perfect season.
  const COMP_FLOOR = 0.80;
  const WEIGHTS = { pts: 0.30, reb: 0.20, ast: 0.20, stl: 0.15, blk: 0.15 };
  const surplus = rawS - S;
  const shortfall = Math.max(0, 0.85 - minRatio) * WEIGHTS[worstCat];
  const maxedOut = minRatio >= 0.85 || (minRatio >= COMP_FLOOR && surplus >= shortfall * 2);

  // Hard Mode tightens the luck gate (45% vs 65%).
  const luckGate = difficulty > 1 ? 0.55 : 0.35;
  if (S >= 0.96 && maxedOut && Math.random() > luckGate) wins = 82;

  // Uncapped team rating (can exceed 100). Cap Mode adds an efficiency bonus
  // for budget left on the table.
  let points = Math.round(rawS * 1000) / 10;
  if (opts.budgetLeft > 0) points = Math.round((points + opts.budgetLeft * 0.3) * 10) / 10;

  // Grade stays on the capped 0–100 scale so the tiers keep their meaning.
  const gradePts = S * 100;
  let grade;
  if (gradePts >= 97) grade = 'S+';
  else if (gradePts >= 94) grade = 'S';
  else if (gradePts >= 88) grade = 'A';
  else if (gradePts >= 78) grade = 'B';
  else if (gradePts >= 65) grade = 'C';
  else grade = 'D';

  // Weakness label. "None — complete roster" is only honest for an actual
  // 82-0: a balanced roster that still falls short isn't flawless, it just
  // lacks the strength or consistency to win out. Naming the real reason keeps
  // the result from reading as the sim mis-judging a perfect team.
  let weakness;
  if (wins === 82) {
    weakness = 'none';            // earned the perfect season — truly complete
  } else if (S >= 0.96 && minRatio >= 0.85) {
    weakness = 'consistency';     // elite and balanced, just couldn't string 82 wins together
  } else if (minRatio >= 0.85) {
    weakness = 'overall';         // no glaring hole, but not strong enough to dominate
  } else {
    weakness = {
      pts: 'weakScoring',
      reb: 'weakRebounding',
      ast: 'weakPlaymaking',
      stl: 'weakSteals',
      blk: 'weakBlocks',
    }[worstCat];
  }

  const best = lineup.reduce((b, p) => {
    const score = q => { const a = adjustedStats(q); return a.pts + a.reb * 1.1 + a.ast * 1.4 + a.stl * 4 + a.blk * 4; };
    return score(p) > score(b) ? p : b;
  }, lineup[0]);

  return {
    wins,
    losses: 82 - wins,
    points,
    grade,
    title: titleKey(wins),
    weakness,
    best,
    totals,
    ratios,
  };
}

// Game-by-game "story" of the simulated season, consistent with the final
// record, for the result-reveal animation. moments maps a game index to a
// caption key the ticker pauses on.
export function buildSeasonStory(result) {
  const lossIdx = new Set();
  while (lossIdx.size < result.losses) lossIdx.add(randomInt(0, 81));

  const games = [];
  for (let i = 0; i < 82; i++) {
    const win = !lossIdx.has(i);
    const base = randomInt(96, 118);
    const margin = win ? randomInt(2, 24) : randomInt(2, 14);
    games.push({
      opp: randomPick(ALL_TEAMS),
      us: win ? base + margin : base,
      them: win ? base : base + margin,
      win,
    });
  }

  const moments = { 0: 'opener', 29: 'christmas', 81: 'finale' };
  let w = 0;
  for (let i = 0; i < 82; i++) {
    if (games[i].win && ++w === 50) { moments[i] = 'win50'; break; }
  }

  // Tighten the closest game to a 1–2 point thriller and pause on it.
  let closest = -1, minMargin = Infinity;
  games.forEach((gm, i) => {
    const m = gm.us - gm.them;
    if (Math.abs(m) < minMargin) { minMargin = Math.abs(m); closest = i; }
  });
  if (closest >= 0) {
    const gm = games[closest];
    const m = randomInt(1, 2);
    if (gm.win) gm.us = gm.them + m;
    else gm.them = gm.us + m;
    moments[closest] = gm.win ? 'closestWin' : 'closestLoss';
  }

  return { games, moments };
}

export function titleKey(wins) {
  if (wins === 82) return 'perfect';
  if (wins >= 78) return 'almost';
  if (wins >= 70) return 'favorite';
  if (wins >= 60) return 'contender';
  return 'playoff';
}

// ---- Challenge Filters (spin-flow variants) ----
// Each filter reshapes the classic spin draft: it shrinks the draftable pool
// and/or bends difficulty, then tags the leaderboard row. `pool(param)` returns
// the player predicate threaded into the draft helpers above; `param` is the
// chosen team (oneFranchise) or decade (oneDecade / randomEra), ignored
// otherwise. `cap` flags the free-draft Salary Cap variant, which is driven by
// the dedicated cap UI rather than the spin pool predicate.
export const FILTERS = {
  classic:      { lbTag: 'standard',  difficulty: 1,    param: null,     pool: () => ALL_PLAYERS },
  cap:          { lbTag: 'cap',       difficulty: 1,    param: null,     cap: true, pool: () => ALL_PLAYERS },
  noMvps:       { lbTag: 'nomvps',    difficulty: 1,    param: null,     pool: () => (p => !MVP_IDS.has(p.id)) },
  oneFranchise: { lbTag: 'franchise', difficulty: 1,    param: 'team',   pool: (team) => (p => p.team === team) },
  oneDecade:    { lbTag: 'decade',    difficulty: 1,    param: 'decade', pool: (d) => (p => p.decade === d) },
  randomEra:    { lbTag: 'decade',    difficulty: 1,    param: 'decade', random: true, pool: (d) => (p => p.decade === d) },
  hard:         { lbTag: 'hard',      difficulty: 1.15, param: null,     pool: () => ALL_PLAYERS },
};

export const FILTER_IDS = Object.keys(FILTERS);

// Franchises whose all-time pool covers every position — One Franchise offers
// only these so a single-team draft can always fill a balanced five.
export const FRANCHISE_TEAMS = [...ALL_TEAMS]
  .filter(team => {
    const cover = new Set();
    PLAYERS.filter(p => p.team === team).forEach(p => p.positions.forEach(pos => cover.add(pos)));
    return POSITIONS.every(pos => cover.has(pos));
  })
  .sort();
