// 7-0 Game engine (82-0 in-site edition). Adds chemistry, variable opponents and
// a knockout gauntlet on top of the formation/fit core.
// Pure & deterministic (no Date/Math.random) so a given lineup always scores the same.

// Pitch coordinates: x 0..100 left→right, y 0..100 top(opponent goal)→bottom(own goal).
export const FORMATIONS = {
  '4-3-3': [
    { id: 'GK', pos: 'GK', x: 50, y: 92 },
    { id: 'RB', pos: 'RB', x: 82, y: 72 },
    { id: 'RCB', pos: 'CB', x: 62, y: 78 },
    { id: 'LCB', pos: 'CB', x: 38, y: 78 },
    { id: 'LB', pos: 'LB', x: 18, y: 72 },
    { id: 'RCM', pos: 'CM', x: 68, y: 50 },
    { id: 'DM', pos: 'DM', x: 50, y: 58 },
    { id: 'LCM', pos: 'CM', x: 32, y: 50 },
    { id: 'RW', pos: 'RW', x: 80, y: 26 },
    { id: 'ST', pos: 'ST', x: 50, y: 20 },
    { id: 'LW', pos: 'LW', x: 20, y: 26 },
  ],
  '4-4-2': [
    { id: 'GK', pos: 'GK', x: 50, y: 92 },
    { id: 'RB', pos: 'RB', x: 82, y: 72 },
    { id: 'RCB', pos: 'CB', x: 62, y: 78 },
    { id: 'LCB', pos: 'CB', x: 38, y: 78 },
    { id: 'LB', pos: 'LB', x: 18, y: 72 },
    { id: 'RM', pos: 'RM', x: 82, y: 48 },
    { id: 'RCM', pos: 'CM', x: 60, y: 52 },
    { id: 'LCM', pos: 'CM', x: 40, y: 52 },
    { id: 'LM', pos: 'LM', x: 18, y: 48 },
    { id: 'RST', pos: 'ST', x: 60, y: 22 },
    { id: 'LST', pos: 'ST', x: 40, y: 22 },
  ],
  '4-2-3-1': [
    { id: 'GK', pos: 'GK', x: 50, y: 92 },
    { id: 'RB', pos: 'RB', x: 82, y: 72 },
    { id: 'RCB', pos: 'CB', x: 62, y: 78 },
    { id: 'LCB', pos: 'CB', x: 38, y: 78 },
    { id: 'LB', pos: 'LB', x: 18, y: 72 },
    { id: 'RDM', pos: 'DM', x: 62, y: 58 },
    { id: 'LDM', pos: 'DM', x: 38, y: 58 },
    { id: 'RAM', pos: 'RW', x: 80, y: 38 },
    { id: 'CAM', pos: 'CAM', x: 50, y: 36 },
    { id: 'LAM', pos: 'LW', x: 20, y: 38 },
    { id: 'ST', pos: 'ST', x: 50, y: 18 },
  ],
  '4-2-4': [
    { id: 'GK', pos: 'GK', x: 50, y: 92 },
    { id: 'RB', pos: 'RB', x: 82, y: 72 },
    { id: 'RCB', pos: 'CB', x: 62, y: 78 },
    { id: 'LCB', pos: 'CB', x: 38, y: 78 },
    { id: 'LB', pos: 'LB', x: 18, y: 72 },
    { id: 'RCM', pos: 'CM', x: 64, y: 52 },
    { id: 'LCM', pos: 'CM', x: 36, y: 52 },
    { id: 'RW', pos: 'RW', x: 84, y: 26 },
    { id: 'RST', pos: 'ST', x: 60, y: 20 },
    { id: 'LST', pos: 'ST', x: 40, y: 20 },
    { id: 'LW', pos: 'LW', x: 16, y: 26 },
  ],
  '3-5-2': [
    { id: 'GK', pos: 'GK', x: 50, y: 92 },
    { id: 'RCB', pos: 'CB', x: 68, y: 78 },
    { id: 'CCB', pos: 'CB', x: 50, y: 80 },
    { id: 'LCB', pos: 'CB', x: 32, y: 78 },
    { id: 'RWB', pos: 'RWB', x: 86, y: 52 },
    { id: 'RCM', pos: 'CM', x: 64, y: 54 },
    { id: 'DM', pos: 'DM', x: 50, y: 60 },
    { id: 'LCM', pos: 'CM', x: 36, y: 54 },
    { id: 'LWB', pos: 'LWB', x: 14, y: 52 },
    { id: 'RST', pos: 'ST', x: 60, y: 22 },
    { id: 'LST', pos: 'ST', x: 40, y: 22 },
  ],
  '5-3-2': [
    { id: 'GK', pos: 'GK', x: 50, y: 92 },
    { id: 'RWB', pos: 'RWB', x: 88, y: 64 },
    { id: 'RCB', pos: 'CB', x: 68, y: 80 },
    { id: 'CCB', pos: 'CB', x: 50, y: 82 },
    { id: 'LCB', pos: 'CB', x: 32, y: 80 },
    { id: 'LWB', pos: 'LWB', x: 12, y: 64 },
    { id: 'RCM', pos: 'CM', x: 66, y: 50 },
    { id: 'CM', pos: 'CM', x: 50, y: 52 },
    { id: 'LCM', pos: 'CM', x: 34, y: 50 },
    { id: 'RST', pos: 'ST', x: 60, y: 22 },
    { id: 'LST', pos: 'ST', x: 40, y: 22 },
  ],
  '4-5-1': [
    { id: 'GK', pos: 'GK', x: 50, y: 92 },
    { id: 'RB', pos: 'RB', x: 82, y: 72 },
    { id: 'RCB', pos: 'CB', x: 62, y: 78 },
    { id: 'LCB', pos: 'CB', x: 38, y: 78 },
    { id: 'LB', pos: 'LB', x: 18, y: 72 },
    { id: 'RM', pos: 'RM', x: 84, y: 46 },
    { id: 'RCM', pos: 'CM', x: 64, y: 52 },
    { id: 'CAM', pos: 'CAM', x: 50, y: 44 },
    { id: 'LCM', pos: 'CM', x: 36, y: 52 },
    { id: 'LM', pos: 'LM', x: 16, y: 46 },
    { id: 'ST', pos: 'ST', x: 50, y: 18 },
  ],
  '3-4-3': [
    { id: 'GK', pos: 'GK', x: 50, y: 92 },
    { id: 'RCB', pos: 'CB', x: 68, y: 78 },
    { id: 'CCB', pos: 'CB', x: 50, y: 80 },
    { id: 'LCB', pos: 'CB', x: 32, y: 78 },
    { id: 'RM', pos: 'RM', x: 84, y: 52 },
    { id: 'RCM', pos: 'CM', x: 62, y: 56 },
    { id: 'LCM', pos: 'CM', x: 38, y: 56 },
    { id: 'LM', pos: 'LM', x: 16, y: 52 },
    { id: 'RW', pos: 'RW', x: 78, y: 24 },
    { id: 'ST', pos: 'ST', x: 50, y: 20 },
    { id: 'LW', pos: 'LW', x: 22, y: 24 },
  ],
};

export const FORMATION_KEYS = Object.keys(FORMATIONS);
export const STYLES = ['Defensive', 'Balanced', 'Attacking'];
export const MODES = ['Classic', 'From memory'];
export const SQUAD_SOURCES = ['National', 'All-Stars'];
export const FORMATS = ['Single', 'Gauntlet'];

// Knockout gauntlet: beat each round's opponent to advance. 4 wins = champions.
export const GAUNTLET_ROUNDS = [
  { key: 'group', opponent: 60 },
  { key: 'round16', opponent: 69 },
  { key: 'semi', opponent: 78 },
  { key: 'final', opponent: 87 },
];

// Single-match uses one fixed, demanding opponent (matches the classic 7-0 difficulty).
export const SINGLE_OPPONENT = 66;

const ATTACK_POS = new Set(['ST', 'RW', 'LW', 'CAM', 'RM', 'LM']);
const DEFENSE_POS = new Set(['GK', 'CB', 'RB', 'LB', 'RWB', 'LWB', 'DM']);

const ADJ = {
  GK: ['GK'],
  RB: ['RB', 'RWB', 'RM', 'CB'],
  LB: ['LB', 'LWB', 'LM', 'CB'],
  CB: ['CB', 'RB', 'LB', 'DM'],
  RWB: ['RWB', 'RB', 'RM', 'RW'],
  LWB: ['LWB', 'LB', 'LM', 'LW'],
  DM: ['DM', 'CM', 'CB'],
  CM: ['CM', 'DM', 'CAM'],
  CAM: ['CAM', 'CM', 'RW', 'LW', 'ST'],
  RM: ['RM', 'RW', 'RWB', 'RB'],
  LM: ['LM', 'LW', 'LWB', 'LB'],
  RW: ['RW', 'RM', 'ST', 'CAM'],
  LW: ['LW', 'LM', 'ST', 'CAM'],
  ST: ['ST', 'CAM', 'RW', 'LW'],
};

// fit of a player at a slot position: 1 exact, 0.8 adjacent, 0 not allowed.
export function fitFor(playerPositions, slotPos) {
  if (!playerPositions || !playerPositions.length) return 0;
  if (playerPositions.includes(slotPos)) return 1;
  const adj = ADJ[slotPos] || [slotPos];
  if (playerPositions.some(p => adj.includes(p))) return 0.8;
  return 0;
}

export function canPlace(playerPositions, slotPos) {
  return fitFor(playerPositions, slotPos) > 0;
}

// On-pitch neighbours of each slot (by Euclidean distance). Cached per formation.
const _neighbourCache = {};
export function slotNeighbours(formationKey) {
  if (_neighbourCache[formationKey]) return _neighbourCache[formationKey];
  const slots = FORMATIONS[formationKey] || [];
  const THRESHOLD = 30; // ~ adjacent on the pitch
  const out = slots.map((a, i) => {
    const near = [];
    slots.forEach((b, j) => {
      if (i === j) return;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d <= THRESHOLD) near.push(j);
    });
    return near;
  });
  _neighbourCache[formationKey] = out;
  return out;
}

// Chemistry 0..100: how well linked players share a nationality with their pitch
// neighbours. In a single-nation squad this is naturally ~100; in All-Stars it
// rewards clustering same-country players together (and punishes lone islands).
export function chemistry(lineup, formationKey) {
  const neighbours = slotNeighbours(formationKey);
  let linkSum = 0, linkCount = 0;
  lineup.forEach((cell, i) => {
    if (!cell || !cell.player) return;
    const nat = cell.player.nat;
    const nbs = neighbours[i].filter(j => lineup[j] && lineup[j].player);
    if (!nbs.length) return;
    const same = nbs.filter(j => lineup[j].player.nat === nat).length;
    linkSum += same / nbs.length;
    linkCount += 1;
  });
  if (!linkCount) return 100;
  return Math.round((linkSum / linkCount) * 100);
}

// Deterministic small jitter from a string seed (FNV-1a → -1..1).
function seedJitter(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = (h >>> 0) / 4294967295;
  return (u - 0.5) * 2;
}

const STYLE_MOD = {
  Defensive: { atk: -6, def: +7 },
  Balanced: { atk: 0, def: 0 },
  Attacking: { atk: +7, def: -6 },
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Raw attack/defense ratings of the eleven (before opponent & chemistry).
// Defensive: any cell without a valid player is skipped, so this never throws.
export function teamRatings(lineup, formationKey, style) {
  const slots = FORMATIONS[formationKey] || [];
  let atkSum = 0, atkW = 0, defSum = 0, defW = 0, totalEff = 0;
  slots.forEach((slot, i) => {
    const cell = lineup[i];
    if (!cell || !cell.player || typeof cell.player.rating !== 'number') return;
    const eff = cell.player.rating * (cell.fit ?? 1);
    totalEff += eff;
    if (ATTACK_POS.has(slot.pos)) { atkSum += eff * 1.2; atkW += 1.2; }
    else if (slot.pos === 'CM') { atkSum += eff; atkW += 1; defSum += eff * 0.6; defW += 0.6; }
    if (DEFENSE_POS.has(slot.pos)) { defSum += eff * (slot.pos === 'GK' ? 1.4 : 1.1); defW += (slot.pos === 'GK' ? 1.4 : 1.1); }
    else if (slot.pos === 'CM') { /* counted above */ }
    else if (!ATTACK_POS.has(slot.pos)) { defSum += eff; defW += 1; }
  });
  const mod = STYLE_MOD[style] || STYLE_MOD.Balanced;
  return {
    attackRaw: clamp((atkW ? atkSum / atkW : 0) + mod.atk, 0, 100),
    defenseRaw: clamp((defW ? defSum / defW : 0) + mod.def, 0, 100),
    overallRaw: totalEff / slots.length,
  };
}

// lineup: array aligned to formation slots, each entry { player, fit } or null.
// opts: { opponent, useChem, roundKey }
export function simulate(lineup, formationKey, style, mode, opts = {}) {
  const slots = FORMATIONS[formationKey] || [];
  const opponent = opts.opponent ?? SINGLE_OPPONENT;
  const { attackRaw, defenseRaw, overallRaw } = teamRatings(lineup, formationKey, style);

  // Chemistry scales attack & defense between 85% (no links) and 100% (perfect).
  const chem = opts.useChem ? chemistry(lineup, formationKey) : 100;
  const chemMul = 0.85 + 0.15 * (chem / 100);
  const attack = clamp(attackRaw * chemMul, 0, 100);
  const defense = clamp(defenseRaw * chemMul, 0, 100);

  const seedParts = [];
  slots.forEach((slot, i) => {
    const cell = lineup[i];
    if (cell && cell.player) seedParts.push(cell.player.name + slot.id);
  });
  const seed = seedParts.join('|') + '#' + formationKey + style + mode + (opts.roundKey || '');
  const j1 = seedJitter(seed + 'a');
  const j2 = seedJitter(seed + 'b');

  // Edge over the opponent drives the scoreline.
  let goalsFor = Math.round((attack - opponent) / 5 + 3 + j1 * 0.9);
  let goalsAgainst = Math.round((opponent - defense) / 6 + 2 + (j2 + 1) * 0.5);
  if (mode === 'From memory') goalsAgainst += 1;
  goalsFor = clamp(goalsFor, 0, 9);
  goalsAgainst = clamp(goalsAgainst, 0, 7);

  return {
    goalsFor,
    goalsAgainst,
    attack: Math.round(attack),
    defense: Math.round(defense),
    overall: Math.round(overallRaw),
    chem,
    perfect: goalsFor === 7 && goalsAgainst === 0,
    win: goalsFor > goalsAgainst,
    draw: goalsFor === goalsAgainst,
  };
}

export function verdictKey(r) {
  if (r.perfect) return 'perfect';
  if (r.goalsAgainst === 0 && r.goalsFor >= 4) return 'demolition';
  if (r.win && r.goalsFor - r.goalsAgainst >= 3) return 'rout';
  if (r.win) return 'win';
  if (r.draw) return 'draw';
  return 'loss';
}
