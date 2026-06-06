// 82-0 Challenge scoring — turns a 5-player lineup into a simulated 82-game record.

function average(nums) {
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function balanceBonus(lineup) {
  const positions = lineup.map(p => p.position);
  const unique = new Set(positions);
  let bonus = 0;

  if (positions.includes('PG') && positions.includes('C')) bonus += 2;
  if (unique.size === 5) bonus += 5;
  else if (unique.size >= 4) bonus += 3;
  if (!positions.includes('C')) bonus -= 3;
  if (!positions.includes('PG')) bonus -= 3;

  const counts = {};
  positions.forEach(p => { counts[p] = (counts[p] || 0) + 1; });
  if (Object.values(counts).some(c => c > 3)) bonus -= 4;

  return bonus;
}

export function scoreLineup(lineup) {
  const avgOverall = average(lineup.map(p => p.overall));
  const avgOffense = average(lineup.map(p => p.offense));
  const avgDefense = average(lineup.map(p => p.defense));
  const avgShooting = average(lineup.map(p => p.shooting));
  const avgPlaymaking = average(lineup.map(p => p.playmaking));
  const avgRebounding = average(lineup.map(p => p.rebounding));
  const avgStarPower = average(lineup.map(p => p.starPower));

  let score =
    avgOverall * 0.45 +
    avgOffense * 0.15 +
    avgDefense * 0.15 +
    avgShooting * 0.1 +
    avgPlaymaking * 0.07 +
    avgRebounding * 0.05 +
    avgStarPower * 0.03 +
    balanceBonus(lineup);

  score = clamp(score, 40, 100);

  const variance = randomInt(-2, 2);
  let wins = clamp(Math.round((score / 100) * 82) + variance, 0, 82);

  // A near-perfect roster has a real shot at the mythical 82-0.
  if (score >= 98 && Math.random() > 0.35) wins = 82;

  return {
    score: Math.round(score),
    wins,
    losses: 82 - wins,
    avgDefense,
    avgShooting,
    avgPlaymaking,
    avgRebounding,
  };
}

// Title key by wins — translated in the UI layer.
export function titleKey(wins) {
  if (wins === 82) return 'perfect';
  if (wins >= 78) return 'almost';
  if (wins >= 70) return 'favorite';
  if (wins >= 60) return 'contender';
  return 'playoff';
}

export function bestPick(lineup) {
  return lineup.reduce((best, p) => (p.overall > best.overall ? p : best), lineup[0]);
}

// Weakness key — translated in the UI layer.
export function weaknessKey(lineup, result) {
  const positions = lineup.map(p => p.position);
  if (!positions.includes('C')) return 'noCenter';
  if (!positions.includes('PG')) return 'noPG';
  if (result.avgDefense < 78) return 'weakDefense';
  if (result.avgShooting < 70) return 'weakShooting';
  if (result.avgPlaymaking < 65) return 'weakPlaymaking';
  if (result.avgRebounding < 65) return 'weakRebounding';
  return 'none';
}
