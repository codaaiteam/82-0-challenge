// 20-0 NFL engine — rating-weighted roster aggregation with a
// non-linear 20-game win-projection curve.

import e00 from '@/data/nfl/2000s.json';
import e10 from '@/data/nfl/2010s.json';
import e20 from '@/data/nfl/2020s.json';

export const NFL_PLAYERS = [...e00, ...e10, ...e20];

// 9 roster slots; WR appears twice.
export const NFL_SLOTS = ['QB', 'RB', 'WR1', 'WR2', 'TE', 'OL', 'EDGE', 'LB', 'DB'];

// Which player position fills which slot.
export function slotAccepts(slot, pos) {
  if (slot === 'WR1' || slot === 'WR2') return pos === 'WR';
  return slot === pos;
}

export const NFL_ERAS = ['2000s', '2010s', '2020s'];

export const NFL_COMBOS = [...new Set(NFL_PLAYERS.map(p => `${p.team}|${p.era}`))].map(key => {
  const [team, era] = key.split('|');
  return { team, era };
});

export const NFL_TEAMS = [...new Set(NFL_PLAYERS.map(p => p.team))];

// Slot weights — championships start at quarterback, but the trenches
// and the secondary still decide Januarys.
const SLOT_W = {
  QB: 0.24, RB: 0.10, WR1: 0.10, WR2: 0.08, TE: 0.07,
  OL: 0.11, EDGE: 0.11, LB: 0.09, DB: 0.10,
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function nflRandomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function nflPlayersFor(team, era, pickedIds) {
  return NFL_PLAYERS.filter(
    p => p.team === team && p.era === era && !pickedIds.includes(p.id)
  );
}

export function nflComboIsDraftable(combo, pickedIds, openSlots) {
  return nflPlayersFor(combo.team, combo.era, pickedIds).some(p =>
    openSlots.some(slot => slotAccepts(slot, p.pos))
  );
}

export function nflDraftableCombos(pickedIds, openSlots, exclude) {
  return NFL_COMBOS.filter(c => {
    if (exclude && c.team === exclude.team && c.era === exclude.era) return false;
    return nflComboIsDraftable(c, pickedIds, openSlots);
  });
}

export function nflSpinCombo(pickedIds, openSlots, exclude) {
  const pool = nflDraftableCombos(pickedIds, openSlots, exclude);
  return nflRandomPick(pool.length ? pool : NFL_COMBOS);
}

export function nflRerollTeam(current, pickedIds, openSlots) {
  const sameEra = nflDraftableCombos(pickedIds, openSlots, current).filter(
    c => c.era === current.era && c.team !== current.team
  );
  if (sameEra.length) return nflRandomPick(sameEra);
  return nflSpinCombo(pickedIds, openSlots, current);
}

export function nflRerollEra(current, pickedIds, openSlots) {
  const sameTeam = nflDraftableCombos(pickedIds, openSlots, current).filter(
    c => c.team === current.team && c.era !== current.era
  );
  if (sameTeam.length) return nflRandomPick(sameTeam);
  const otherEra = nflDraftableCombos(pickedIds, openSlots, current).filter(
    c => c.era !== current.era
  );
  if (otherEra.length) return nflRandomPick(otherEra);
  return nflSpinCombo(pickedIds, openSlots, current);
}

// ---- 20-game season simulation ----

export function nflSimulateSeason(slots) {
  // slots: { QB: player, ..., WR1: player, WR2: player }
  let S = 0;
  let minNorm = 1;
  let worstSlot = 'QB';
  NFL_SLOTS.forEach(slot => {
    const p = slots[slot];
    const norm = Math.min(1, p.rating / 99);
    S += SLOT_W[slot] * norm;
    if (norm < minNorm) { minNorm = norm; worstSlot = slot; }
  });

  const qbNorm = slots.QB.rating / 99;

  // Fewer games, higher stakes — the curve is steeper than basketball's.
  let wins = Math.round(20 * Math.pow(S, 3)) + randomInt(-1, 1);

  // Gates: you cannot hide a weakness across a playoff run.
  if (qbNorm < 0.76) wins = Math.min(wins, 14);
  if (minNorm < 0.65) wins = Math.min(wins, 16);

  wins = Math.max(2, Math.min(19, wins));

  // Perfection: elite QB plus no soft spots anywhere.
  if (S >= 0.94 && qbNorm >= 0.93 && minNorm >= 0.8 && Math.random() > 0.35) wins = 20;

  const points = Math.round(S * 1000) / 10;

  let grade;
  if (points >= 97) grade = 'S+';
  else if (points >= 94) grade = 'S';
  else if (points >= 88) grade = 'A';
  else if (points >= 78) grade = 'B';
  else if (points >= 65) grade = 'C';
  else grade = 'D';

  // Weakness by worst slot group.
  let weakness = 'none';
  if (minNorm < 0.8) {
    if (worstSlot === 'QB') weakness = 'weakQB';
    else if (worstSlot === 'OL' || worstSlot === 'EDGE') weakness = 'weakTrenches';
    else if (worstSlot === 'LB' || worstSlot === 'DB') weakness = 'weakSecondary';
    else weakness = 'weakSkill';
  }

  const best = NFL_SLOTS.map(s => slots[s]).reduce((b, p) => (p.rating > b.rating ? p : b));

  let title;
  if (wins === 20) title = 'perfect';
  else if (wins >= 18) title = 'almost';
  else if (wins >= 15) title = 'favorite';
  else if (wins >= 12) title = 'contender';
  else title = 'playoff';

  return { wins, losses: 20 - wins, points, grade, title, weakness, best };
}
