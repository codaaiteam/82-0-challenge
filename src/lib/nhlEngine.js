// 82-0 NHL engine — rating-weighted six-man lineup aggregation with an
// 82-game win-projection curve. The NHL plays the same 82-game schedule as
// the NBA, so "82-0" translates to hockey natively.

import h80 from '@/data/nhl/1980s.json';
import h90 from '@/data/nhl/1990s.json';
import h00 from '@/data/nhl/2000s.json';
import h10 from '@/data/nhl/2010s.json';
import h20 from '@/data/nhl/2020s.json';

export const NHL_PLAYERS = [...h80, ...h90, ...h00, ...h10, ...h20];

// 6 lineup slots: three forwards, a defense pair, and the goalie.
export const NHL_SLOTS = ['C', 'LW', 'RW', 'D1', 'D2', 'G'];

// Which player position fills which slot.
export function nhlSlotAccepts(slot, pos) {
  if (slot === 'D1' || slot === 'D2') return pos === 'D';
  return slot === pos;
}

export const NHL_ERAS = ['1980s', '1990s', '2000s', '2010s', '2020s'];

export const NHL_COMBOS = [...new Set(NHL_PLAYERS.map(p => `${p.team}|${p.era}`))].map(key => {
  const [team, era] = key.split('|');
  return { team, era };
});

export const NHL_TEAMS = [...new Set(NHL_PLAYERS.map(p => p.team))];

// Slot weights — goaltending steals games, but you still need a center who
// drives play and a blue line that survives 82 nights.
const SLOT_W = {
  C: 0.22, LW: 0.13, RW: 0.13, D1: 0.17, D2: 0.13, G: 0.22,
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function nhlRandomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function nhlPlayersFor(team, era, pickedIds) {
  return NHL_PLAYERS.filter(
    p => p.team === team && p.era === era && !pickedIds.includes(p.id)
  );
}

export function nhlComboIsDraftable(combo, pickedIds, openSlots) {
  return nhlPlayersFor(combo.team, combo.era, pickedIds).some(p =>
    openSlots.some(slot => nhlSlotAccepts(slot, p.pos))
  );
}

export function nhlDraftableCombos(pickedIds, openSlots, exclude) {
  return NHL_COMBOS.filter(c => {
    if (exclude && c.team === exclude.team && c.era === exclude.era) return false;
    return nhlComboIsDraftable(c, pickedIds, openSlots);
  });
}

export function nhlSpinCombo(pickedIds, openSlots, exclude) {
  const pool = nhlDraftableCombos(pickedIds, openSlots, exclude);
  return nhlRandomPick(pool.length ? pool : NHL_COMBOS);
}

export function nhlRerollTeam(current, pickedIds, openSlots) {
  const sameEra = nhlDraftableCombos(pickedIds, openSlots, current).filter(
    c => c.era === current.era && c.team !== current.team
  );
  if (sameEra.length) return nhlRandomPick(sameEra);
  return nhlSpinCombo(pickedIds, openSlots, current);
}

export function nhlRerollEra(current, pickedIds, openSlots) {
  const sameTeam = nhlDraftableCombos(pickedIds, openSlots, current).filter(
    c => c.team === current.team && c.era !== current.era
  );
  if (sameTeam.length) return nhlRandomPick(sameTeam);
  const otherEra = nhlDraftableCombos(pickedIds, openSlots, current).filter(
    c => c.era !== current.era
  );
  if (otherEra.length) return nhlRandomPick(otherEra);
  return nhlSpinCombo(pickedIds, openSlots, current);
}

// ---- 82-game season simulation ----

export function nhlSimulateSeason(slots) {
  // slots: { C: player, LW: player, RW: player, D1: player, D2: player, G: player }
  let S = 0;
  let minNorm = 1;
  let worstSlot = 'C';
  NHL_SLOTS.forEach(slot => {
    const p = slots[slot];
    const norm = Math.min(1, p.rating / 99);
    S += SLOT_W[slot] * norm;
    if (norm < minNorm) { minNorm = norm; worstSlot = slot; }
  });

  const gNorm = slots.G.rating / 99;

  // 82 games forgive a bad night but not a bad roster — a long, steep curve.
  // Thresholds are tuned to the NHL pool's 80-99 rating band (no sub-80 cards).
  let wins = Math.round(82 * Math.pow(S, 3)) + randomInt(-3, 3);

  // Gates: an average goalie or one passenger costs you nights all year.
  if (gNorm < 0.88) wins = Math.min(wins, 58);
  if (minNorm < 0.83) wins = Math.min(wins, 66);

  wins = Math.max(12, Math.min(81, wins));

  // Perfection: a wall in net and no soft spots anywhere.
  if (S >= 0.94 && gNorm >= 0.95 && minNorm >= 0.88 && Math.random() > 0.35) wins = 82;

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
  if (minNorm < 0.88) {
    if (worstSlot === 'G') weakness = 'weakGoalie';
    else if (worstSlot === 'D1' || worstSlot === 'D2') weakness = 'weakBlueline';
    else weakness = 'weakScoring';
  }

  const best = NHL_SLOTS.map(s => slots[s]).reduce((b, p) => (p.rating > b.rating ? p : b));

  let title;
  if (wins === 82) title = 'perfect';
  else if (wins >= 72) title = 'almost';
  else if (wins >= 62) title = 'favorite';
  else if (wins >= 50) title = 'contender';
  else title = 'playoff';

  return { wins, losses: 82 - wins, points, grade, title, weakness, best };
}
