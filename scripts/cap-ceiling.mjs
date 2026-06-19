// Cap gauntlet balance tool. Replicates engine.js pricing + the 82-0 capped-S
// math against the real player pool, then for each gauntlet level reports the
// strongest five you can AFFORD ("ceiling") and verifies the configured gate
// (GAUNTLET_GATE in src/lib/engine.js) is clearable under both the S threshold
// and the minFloor balance constraint. Run: `node scripts/cap-ceiling.mjs`.
// Re-run after editing player data or the gate table to confirm every level
// stays winnable with a shrinking margin.
import fs from 'fs';
const dir = 'src/data/players/';
const decs = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
let P = [];
for (const d of decs) P.push(...JSON.parse(fs.readFileSync(dir + d + '.json', 'utf8')));
const EA = { '1960s': { pts: .80, reb: .62, ast: .85, stl: .90, blk: .90 }, '1970s': { pts: .88, reb: .78, ast: .90, stl: .95, blk: .95 }, '1980s': { pts: .94, reb: .92, ast: .95, stl: 1, blk: 1 }, '1990s': { pts: 1, reb: 1, ast: 1, stl: 1, blk: 1 }, '2000s': { pts: 1.04, reb: 1, ast: 1, stl: 1.05, blk: 1 }, '2010s': { pts: 1, reb: .98, ast: .98, stl: 1.05, blk: 1.05 }, '2020s': { pts: .94, reb: .96, ast: .96, stl: 1.10, blk: 1.10 } };
const C = ['pts', 'reb', 'ast', 'stl', 'blk'], B = { pts: 122, reb: 44, ast: 27, stl: 7.2, blk: 4.6 }, POS = ['PG', 'SG', 'SF', 'PF', 'C'];
const adj = p => { const a = EA[p.decade], o = {}; for (const c of C) o[c] = p[c] * a[c]; return o; };
const prod = p => { const a = adj(p); return a.pts + a.reb * 1.1 + a.ast * 1.4 + a.stl * 4 + a.blk * 4; };
const sc = P.map(prod), mn = Math.min(...sc), mx = Math.max(...sc);
P.forEach(p => { p._pr = Math.round(5 + 27 * Math.pow((prod(p) - mn) / (mx - mn), .85)); p._a = adj(p); });
const ev = f => { const t = { pts: 0, reb: 0, ast: 0, stl: 0, blk: 0 }; f.forEach(p => C.forEach(c => t[c] += p._a[c])); const r = {}; C.forEach(c => r[c] = Math.min(1, t[c] / B[c])); const S = r.pts * .3 + r.reb * .2 + r.ast * .2 + r.stl * .15 + r.blk * .15; return { S, minR: Math.min(...C.map(c => r[c])), pr: f.reduce((s, p) => s + p._pr, 0) }; };
const byP = {}; POS.forEach(pos => byP[pos] = P.filter(p => p.positions.includes(pos)).sort((a, b) => a._pr - b._pr));
// maximize S subject to minR>=floor and price<=budget (hill-climb w/ penalty)
function feas(budget, floor, restarts) {
  let bS = -1, bE = null;
  const key = e => { let pen = 0; if (e.pr > budget) pen += (e.pr - budget) * 0.5; if (e.minR < floor) pen += (floor - e.minR) * 2; return e.S - pen; };
  for (let i = 0; i < restarts; i++) {
    let asg = {}, used = new Set();
    for (const pos of [...POS].sort(() => Math.random() - .5)) { const c = byP[pos].filter(p => !used.has(p.name)); const p = c[Math.floor(Math.random() * Math.min(c.length, 40))]; asg[pos] = p; used.add(p.name); }
    let five = POS.map(p => asg[p]), cur = ev(five), imp = true;
    while (imp) { imp = false; for (const pos of POS) { let bp = asg[pos], bk = key(cur); const nm = new Set(five.filter(p => p !== asg[pos]).map(p => p.name)); for (const cd of byP[pos]) { if (nm.has(cd.name)) continue; const e = ev(POS.map(pp => ({ ...asg, [pos]: cd })[pp])); const k = key(e); if (k > bk) { bk = k; bp = cd; } } if (bp !== asg[pos]) { asg[pos] = bp; five = POS.map(p => asg[p]); cur = ev(five); imp = true; } } }
    if (cur.pr <= budget && cur.minR >= floor && cur.S > bS) { bS = cur.S; bE = cur; }
  }
  return bE;
}
// Keep in sync with GAUNTLET_GATE in src/lib/engine.js: [budget, sThreshold, minFloor]
const GATE = [[120, .80, .55], [110, .82, .58], [100, .82, .60], [90, .78, .58], [80, .72, .55], [70, .66, .50], [60, .59, .45], [50, .51, .40], [40, .43, .33], [30, .33, .26]];
console.log('Lv | $bud | sThr | floor | bestS@floor | pass? | margin');
GATE.forEach(([bud, thr, fl], i) => {
  const r = feas(bud, fl, 6000);
  if (!r) { console.log(`L${i + 1} $${bud} no feasible roster meeting floor`); return; }
  const pass = r.S >= thr;
  console.log(`L${String(i + 1).padStart(2)} | $${String(bud).padStart(3)} | ${thr.toFixed(2)} | ${fl.toFixed(2)}  |   ${r.S.toFixed(3)}    |  ${pass ? 'YES' : 'NO '}  | ${(r.S - thr >= 0 ? '+' : '')}${(r.S - thr).toFixed(3)} (weakest ${r.minR.toFixed(2)})`);
});
