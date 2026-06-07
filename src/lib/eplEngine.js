// 38-0 Premier League engine — rating-weighted XI aggregation with a
// non-linear 38-game win-projection curve. Chase the perfect Invincibles+.

import e90 from '@/data/epl/1990s.json';
import e00 from '@/data/epl/2000s.json';
import e10 from '@/data/epl/2010s.json';
import e20 from '@/data/epl/2020s.json';

export const EPL_PLAYERS = [...e90, ...e00, ...e10, ...e20];

// 4-4-2 starting XI.
export const EPL_SLOTS = [
  'GK',
  'DF1', 'DF2', 'DF3', 'DF4',
  'MF1', 'MF2', 'MF3', 'MF4',
  'FW1', 'FW2',
];

export function eplSlotAccepts(slot, pos) {
  if (slot === 'GK') return pos === 'GK';
  return slot.startsWith(pos);
}

// Pretty slot label for display (DF1 → DF etc.)
export function eplSlotLabel(slot) {
  return slot === 'GK' ? 'GK' : slot.slice(0, 2);
}

export const EPL_ERAS = ['1990s', '2000s', '2010s', '2020s'];

export const EPL_COMBOS = [...new Set(EPL_PLAYERS.map(p => `${p.club}|${p.era}`))].map(key => {
  const [club, era] = key.split('|');
  return { team: club, era };
});

export const EPL_CLUBS = [...new Set(EPL_PLAYERS.map(p => p.club))];

// Slot weights — spine wins titles: keeper, midfield control, and goals.
const SLOT_W = {
  GK: 0.12,
  DF1: 0.08, DF2: 0.08, DF3: 0.08, DF4: 0.08,
  MF1: 0.09, MF2: 0.09, MF3: 0.09, MF4: 0.09,
  FW1: 0.10, FW2: 0.10,
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function eplRandomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function eplPlayersFor(club, era, pickedIds) {
  return EPL_PLAYERS.filter(
    p => p.club === club && p.era === era && !pickedIds.includes(p.id)
  );
}

export function eplComboIsDraftable(combo, pickedIds, openSlots) {
  return eplPlayersFor(combo.team, combo.era, pickedIds).some(p =>
    openSlots.some(slot => eplSlotAccepts(slot, p.pos))
  );
}

export function eplDraftableCombos(pickedIds, openSlots, exclude) {
  return EPL_COMBOS.filter(c => {
    if (exclude && c.team === exclude.team && c.era === exclude.era) return false;
    return eplComboIsDraftable(c, pickedIds, openSlots);
  });
}

export function eplSpinCombo(pickedIds, openSlots, exclude) {
  const pool = eplDraftableCombos(pickedIds, openSlots, exclude);
  return eplRandomPick(pool.length ? pool : EPL_COMBOS);
}

export function eplRerollTeam(current, pickedIds, openSlots) {
  const sameEra = eplDraftableCombos(pickedIds, openSlots, current).filter(
    c => c.era === current.era && c.team !== current.team
  );
  if (sameEra.length) return eplRandomPick(sameEra);
  return eplSpinCombo(pickedIds, openSlots, current);
}

export function eplRerollEra(current, pickedIds, openSlots) {
  const sameTeam = eplDraftableCombos(pickedIds, openSlots, current).filter(
    c => c.team === current.team && c.era !== current.era
  );
  if (sameTeam.length) return eplRandomPick(sameTeam);
  const otherEra = eplDraftableCombos(pickedIds, openSlots, current).filter(
    c => c.era !== current.era
  );
  if (otherEra.length) return eplRandomPick(otherEra);
  return eplSpinCombo(pickedIds, openSlots, current);
}

// ---- 38-game season simulation ----

export function eplSimulateSeason(slots) {
  let S = 0;
  let minNorm = 1;
  let worstSlot = 'GK';
  EPL_SLOTS.forEach(slot => {
    const p = slots[slot];
    const norm = Math.min(1, p.rating / 99);
    S += SLOT_W[slot] * norm;
    if (norm < minNorm) { minNorm = norm; worstSlot = slot; }
  });

  const gkNorm = slots.GK.rating / 99;

  // 38 games, no margin for error — the curve punishes anything mortal.
  let wins = Math.round(38 * Math.pow(S, 3)) + randomInt(-1, 1);

  // Gates: a shaky keeper or one weak link costs you the unbeaten run.
  if (gkNorm < 0.74) wins = Math.min(wins, 27);
  if (minNorm < 0.65) wins = Math.min(wins, 31);

  wins = Math.max(5, Math.min(37, wins));

  // Perfection: a world-class spine and no passengers anywhere.
  if (S >= 0.94 && gkNorm >= 0.92 && minNorm >= 0.8 && Math.random() > 0.35) wins = 38;

  const points = Math.round(S * 1000) / 10;

  let grade;
  if (points >= 97) grade = 'S+';
  else if (points >= 94) grade = 'S';
  else if (points >= 88) grade = 'A';
  else if (points >= 78) grade = 'B';
  else if (points >= 65) grade = 'C';
  else grade = 'D';

  let weakness = 'none';
  if (minNorm < 0.8) {
    const posType = worstSlot === 'GK' ? 'GK' : worstSlot.slice(0, 2);
    weakness = {
      GK: 'weakGK',
      DF: 'weakDefense',
      MF: 'weakMidfield',
      FW: 'weakAttack',
    }[posType];
  }

  const best = EPL_SLOTS.map(s => slots[s]).reduce((b, p) => (p.rating > b.rating ? p : b));

  let title;
  if (wins === 38) title = 'perfect';
  else if (wins >= 34) title = 'almost';
  else if (wins >= 29) title = 'favorite';
  else if (wins >= 23) title = 'contender';
  else title = 'playoff';

  return { wins, losses: 38 - wins, points, grade, title, weakness, best };
}
