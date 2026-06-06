import players from '@/data/players.json';

export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// All Team+Era combos that exist in the player pool.
export const COMBOS = [...new Set(players.map(p => `${p.team}|${p.era}`))].map(key => {
  const [team, era] = key.split('|');
  return { team, era };
});

// Draw a random combo with candidates the user hasn't already picked.
// Retries until a combo with at least one available player is found.
export function drawRound(pickedIds, excludeCombo) {
  const available = COMBOS.filter(c => {
    if (excludeCombo && c.team === excludeCombo.team && c.era === excludeCombo.era) return false;
    return players.some(p => p.team === c.team && p.era === c.era && !pickedIds.includes(p.id));
  });
  const pool = available.length > 0 ? available : COMBOS;
  const combo = randomPick(pool);
  const candidates = shuffle(
    players.filter(p => p.team === combo.team && p.era === combo.era && !pickedIds.includes(p.id))
  ).slice(0, 5);
  return { ...combo, candidates };
}
