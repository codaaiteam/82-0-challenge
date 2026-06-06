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

// ---- Draft helpers ----

export function playersFor(team, decade, pickedIds) {
  return PLAYERS.filter(
    p => p.team === team && p.decade === decade && !pickedIds.includes(p.id)
  );
}

// A combo is draftable if at least one un-picked player fits an open slot.
export function comboIsDraftable(combo, pickedIds, openSlots) {
  return playersFor(combo.team, combo.decade, pickedIds).some(p =>
    p.positions.some(pos => openSlots.includes(pos))
  );
}

export function draftableCombos(pickedIds, openSlots, exclude) {
  return COMBOS.filter(c => {
    if (exclude && c.team === exclude.team && c.decade === exclude.decade) return false;
    return comboIsDraftable(c, pickedIds, openSlots);
  });
}

// Random combo for a new round (or a full reroll).
export function spinCombo(pickedIds, openSlots, exclude) {
  const pool = draftableCombos(pickedIds, openSlots, exclude);
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
export function rerollTeam(current, pickedIds, openSlots) {
  const sameDecade = draftableCombos(pickedIds, openSlots, current).filter(
    c => c.decade === current.decade && c.team !== current.team
  );
  if (sameDecade.length) return randomPick(sameDecade);
  return spinCombo(pickedIds, openSlots, current);
}

// Era skip: new random decade, same team if possible.
export function rerollEra(current, pickedIds, openSlots) {
  const sameTeam = draftableCombos(pickedIds, openSlots, current).filter(
    c => c.team === current.team && c.decade !== current.decade
  );
  if (sameTeam.length) return randomPick(sameTeam);
  const otherDecade = draftableCombos(pickedIds, openSlots, current).filter(
    c => c.decade !== current.decade
  );
  if (otherDecade.length) return randomPick(otherDecade);
  return spinCombo(pickedIds, openSlots, current);
}

// ---- Season simulation ----

export function simulateSeason(lineup) {
  // lineup: array of 5 players
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

  // Non-linear curve: each additional win gets harder to earn.
  let wins = Math.round(82 * Math.pow(S, 2.6)) + randomInt(-2, 2);

  // Category gates — one glaring hole kills a perfect season.
  if (minRatio < 0.6) wins = Math.min(wins, 68);
  else if (minRatio < 0.75) wins = Math.min(wins, 76);

  wins = Math.max(8, Math.min(81, wins));

  // The threshold: maximize every category at once for a shot at 82-0.
  if (S >= 0.96 && minRatio >= 0.85 && Math.random() > 0.35) wins = 82;

  const points = Math.round(S * 1000) / 10; // 0–100.0 team rating

  let grade;
  if (points >= 97) grade = 'S+';
  else if (points >= 94) grade = 'S';
  else if (points >= 88) grade = 'A';
  else if (points >= 78) grade = 'B';
  else if (points >= 65) grade = 'C';
  else grade = 'D';

  // Weakness: the category furthest below benchmark.
  let weakness = 'none';
  if (minRatio < 0.85) {
    const worst = CATS.reduce((w, c) => (ratios[c] < ratios[w] ? c : w), CATS[0]);
    weakness = {
      pts: 'weakScoring',
      reb: 'weakRebounding',
      ast: 'weakPlaymaking',
      stl: 'weakSteals',
      blk: 'weakBlocks',
    }[worst];
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

export function titleKey(wins) {
  if (wins === 82) return 'perfect';
  if (wins >= 78) return 'almost';
  if (wins >= 70) return 'favorite';
  if (wins >= 60) return 'contender';
  return 'playoff';
}
