// Merges the modern squad groups with the legendary editions into one TEAMS list,
// and builds randomised All-Stars pools for the cross-nation mode.
import groupA from '@/data/wc/group-a.json';
import groupB from '@/data/wc/group-b.json';
import groupC from '@/data/wc/group-c.json';
import groupD from '@/data/wc/group-d.json';
import legends from '@/data/wc/legends.json';

const base = [...groupA, ...groupB, ...groupC, ...groupD];

// Fold legendary editions into the matching team's editions map.
const byId = new Map(base.map(t => [t.id, { ...t, editions: { ...t.editions } }]));
legends.forEach(({ id, editions }) => {
  const team = byId.get(id);
  if (team) Object.assign(team.editions, editions);
});

export const TEAMS = [...byId.values()];

// Editions sorted so legends (older years) read naturally next to the modern ones.
export function editionsOf(teamId) {
  const t = TEAMS.find(x => x.id === teamId);
  if (!t) return [];
  return Object.keys(t.editions).sort();
}

export function getSquad(teamId, edition) {
  const t = TEAMS.find(x => x.id === teamId);
  if (!t) return [];
  return (t.editions[edition] || []).map(p => ({ ...p, nat: teamId, natName: t.name, flag: t.flag }));
}

// A flat pool of every player across every team/edition, tagged with nationality.
function allPlayers() {
  const out = [];
  TEAMS.forEach(t => {
    Object.entries(t.editions).forEach(([ed, squad]) => {
      squad.forEach(p => out.push({ ...p, nat: t.id, natName: t.name, flag: t.flag, edition: ed }));
    });
  });
  return out;
}

// Deduplicate a player name so the All-Stars list never shows the same legend twice
// (e.g. a player who appears in two editions). Keeps the highest-rated version.
function dedupeByName(players) {
  const best = new Map();
  players.forEach(p => {
    const cur = best.get(p.name);
    if (!cur || p.rating > cur.rating) best.set(p.name, p);
  });
  return [...best.values()];
}

// Build a balanced All-Stars pool: a deterministic-ish but varied draw of top
// players spread across positions, so any formation is fillable. `pick` is a
// 0..1 number (caller supplies randomness) used to rotate the selection.
export function buildAllStarsPool(pick = 0) {
  const all = dedupeByName(allPlayers());
  // Bucket by a coarse role so the pool always covers the whole pitch.
  const role = (p) => {
    if (p.pos.includes('GK')) return 'GK';
    if (p.pos.some(x => ['CB', 'RB', 'LB', 'RWB', 'LWB'].includes(x))) return 'DEF';
    if (p.pos.some(x => ['DM', 'CM', 'CAM', 'RM', 'LM'].includes(x))) return 'MID';
    return 'ATT';
  };
  const buckets = { GK: [], DEF: [], MID: [], ATT: [] };
  all.forEach(p => buckets[role(p)].push(p));
  // Sort each bucket by rating, then take a window offset by `pick` for variety.
  const take = (arr, n) => {
    const sorted = [...arr].sort((a, b) => b.rating - a.rating);
    const top = sorted.slice(0, Math.min(sorted.length, n * 3));
    const offset = Math.floor(pick * Math.max(1, top.length - n));
    return top.slice(offset, offset + n);
  };
  const pool = [
    ...take(buckets.GK, 3),
    ...take(buckets.DEF, 12),
    ...take(buckets.MID, 12),
    ...take(buckets.ATT, 11),
  ];
  // Stable jersey numbers for display.
  return pool.map((p, i) => ({ ...p, n: i + 1 }));
}
