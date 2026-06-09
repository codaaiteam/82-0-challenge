'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './WorldCup.module.css';
import { TEAMS, editionsOf, getSquad, buildAllStarsPool } from '@/lib/wcTeams';
import {
  FORMATIONS, FORMATION_KEYS, STYLES, MODES, SQUAD_SOURCES, FORMATS,
  GAUNTLET_ROUNDS, SINGLE_OPPONENT,
  fitFor, canPlace, simulate, chemistry, verdictKey,
} from '@/lib/wcEngine';

const STREAK_KEY = '82-0-wc-stats';

function tr(t, path, fallback) {
  const v = path.split('.').reduce((o, k) => (o == null ? o : o[k]), t);
  return v == null ? fallback : v;
}

export default function WorldCupGame({ t }) {
  const g = (k, f) => tr(t, `wcGame.${k}`, f);

  const [formationKey, setFormationKey] = useState('4-3-3');
  const [style, setStyle] = useState('Balanced');
  const [mode, setMode] = useState('Classic');
  const [source, setSource] = useState('National');
  const [format, setFormat] = useState('Single');

  const [drawn, setDrawn] = useState(null); // National: { teamId, edition }; All-Stars: { allStars: true }
  const [pool, setPool] = useState([]); // active squad list (national squad or all-stars pool)
  const [rerolls, setRerolls] = useState(3);
  const [lineup, setLineup] = useState(Array(11).fill(null));
  const [usedNs, setUsedNs] = useState(new Set());
  const [inHand, setInHand] = useState(null);
  const [result, setResult] = useState(null);
  const [gauntlet, setGauntlet] = useState(null); // { round, results: [], status }
  const [stats, setStats] = useState({ perfects: 0, wins: 0, games: 0, champions: 0, bestStreak: 0, streak: 0 });

  const slots = FORMATIONS[formationKey];
  const team = drawn && !drawn.allStars ? TEAMS.find(x => x.id === drawn.teamId) : null;
  const squad = pool;
  const useChem = source === 'All-Stars';

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STREAK_KEY) || 'null');
      if (s) setStats({ champions: 0, ...s });
    } catch {}
  }, []);

  const playerKey = (p) => p.name;
  const filledCount = lineup.filter(Boolean).length;

  function rng() {
    // randomness lives here in the client component (engine stays pure)
    return Math.random();
  }

  function drawNational(opts = {}) {
    const teamId = opts.keepTeam && drawn && !drawn.allStars ? drawn.teamId
      : TEAMS[Math.floor(rng() * TEAMS.length)].id;
    const eds = editionsOf(teamId);
    const edition = opts.keepEdition && drawn && team ? drawn.edition
      : eds[Math.floor(rng() * eds.length)];
    return { teamId, edition };
  }

  function resetBoard(fmt) {
    const f = fmt || format;
    setLineup(Array(11).fill(null));
    setUsedNs(new Set());
    setInHand(null);
    setResult(null);
    setGauntlet(f === 'Gauntlet' ? { round: 0, results: [], status: 'playing' } : null);
  }

  function onRoll() {
    if (source === 'All-Stars') {
      setDrawn({ allStars: true });
      setPool(buildAllStarsPool(rng()));
    } else {
      const d = drawNational();
      setDrawn(d);
      setPool(getSquad(d.teamId, d.edition));
    }
    resetBoard();
    setRerolls(3);
  }

  function reroll(kind) {
    if (rerolls <= 0) return;
    if (source === 'All-Stars') {
      setPool(buildAllStarsPool(rng()));
    } else {
      const d = drawNational(kind === 'team' ? { keepEdition: false } : { keepTeam: true });
      setDrawn(d);
      setPool(getSquad(d.teamId, d.edition));
    }
    resetBoard();
    setRerolls(r => r - 1);
  }

  const eligibleSlots = useMemo(() => {
    if (inHand == null || !squad[inHand]) return new Set();
    const p = squad[inHand];
    const set = new Set();
    slots.forEach((s, i) => { if (canPlace(p.pos, s.pos)) set.add(i); });
    return set;
  }, [inHand, squad, slots]);

  function pickPlayer(i) {
    if (usedNs.has(playerKey(squad[i]))) return;
    setInHand(prev => (prev === i ? null : i));
  }

  function clickSlot(slotIdx) {
    const cur = lineup[slotIdx];
    if (inHand == null) {
      if (cur) {
        const next = [...lineup]; next[slotIdx] = null; setLineup(next);
        const u = new Set(usedNs); u.delete(playerKey(cur.player)); setUsedNs(u);
        setResult(null);
      }
      return;
    }
    const p = squad[inHand];
    const fit = fitFor(p.pos, slots[slotIdx].pos);
    if (fit <= 0) return;
    const next = [...lineup];
    const u = new Set(usedNs);
    if (cur) u.delete(playerKey(cur.player));
    next[slotIdx] = { player: p, fit };
    u.add(playerKey(p));
    setLineup(next);
    setUsedNs(u);
    setInHand(null);
    setResult(null);
  }

  function autoFill() {
    const next = [...lineup];
    const u = new Set(usedNs);
    slots.forEach((s, i) => {
      if (next[i]) return;
      let best = null, bestScore = -1;
      squad.forEach(p => {
        if (u.has(playerKey(p))) return;
        const fit = fitFor(p.pos, s.pos);
        if (fit <= 0) return;
        const score = p.rating * fit;
        if (score > bestScore) { bestScore = score; best = p; }
      });
      if (best) { next[i] = { player: best, fit: fitFor(best.pos, s.pos) }; u.add(playerKey(best)); }
    });
    setLineup(next); setUsedNs(u); setInHand(null); setResult(null);
  }

  function clearLineup() {
    setLineup(Array(11).fill(null)); setUsedNs(new Set()); setInHand(null); setResult(null);
  }

  const liveChem = useMemo(
    () => (useChem && filledCount > 0 ? chemistry(lineup, formationKey) : null),
    [useChem, lineup, formationKey, filledCount]
  );

  function bumpStats(patch) {
    setStats(prev => {
      const next = { ...prev, ...patch(prev) };
      try { localStorage.setItem(STREAK_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function onSimulate() {
    if (filledCount < 11) return;

    if (format === 'Gauntlet') {
      const round = gauntlet?.round ?? 0;
      const cfg = GAUNTLET_ROUNDS[round];
      const r = simulate(lineup, formationKey, style, mode, {
        opponent: cfg.opponent, useChem, roundKey: cfg.key,
      });
      const results = [...(gauntlet?.results || []), { ...r, roundKey: cfg.key }];
      if (!r.win) {
        setGauntlet({ round, results, status: 'out' });
        setResult({ ...r, gauntletEnd: 'out', round });
        bumpStats(prev => ({ games: prev.games + 1, streak: 0 }));
      } else if (round === GAUNTLET_ROUNDS.length - 1) {
        setGauntlet({ round, results, status: 'champion' });
        setResult({ ...r, gauntletEnd: 'champion', round });
        bumpStats(prev => {
          const streak = prev.streak + 1;
          return {
            games: prev.games + 1,
            wins: prev.wins + 1,
            champions: prev.champions + 1,
            perfects: prev.perfects + results.filter(x => x.perfect).length,
            streak,
            bestStreak: Math.max(prev.bestStreak, streak),
          };
        });
      } else {
        setGauntlet({ round, results, status: 'won-round' });
        setResult({ ...r, gauntletEnd: 'advance', round });
      }
      return;
    }

    const r = simulate(lineup, formationKey, style, mode, { opponent: SINGLE_OPPONENT, useChem });
    setResult(r);
    bumpStats(prev => {
      const streak = r.win ? prev.streak + 1 : 0;
      return {
        games: prev.games + 1,
        wins: prev.wins + (r.win ? 1 : 0),
        perfects: prev.perfects + (r.perfect ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
      };
    });
  }

  function advanceRound() {
    // keep the lineup, let the player tweak it, then simulate the next round
    setGauntlet(prev => ({ round: prev.round + 1, results: prev.results, status: 'playing' }));
    setResult(null);
  }

  const drawnTitle = drawn?.allStars
    ? g('allStarsDraw', 'WORLD ALL-STARS')
    : `${team?.name || ''}`;

  return (
    <div className={styles.game}>
      {/* ============ LEFT: controls ============ */}
      <div className={styles.left}>
        {!drawn ? (
          <>
            <div className={styles.panel}>
              <div className={styles.panelLabel}>{g('squad', 'SQUAD')}</div>
              <div className={styles.chipRow}>
                {SQUAD_SOURCES.map(s => (
                  <button key={s} className={`${styles.chip} ${source === s ? styles.chipOn : ''}`} onClick={() => setSource(s)}>
                    {g('sources.' + s, s)}
                  </button>
                ))}
              </div>
              <div className={styles.panelLabel}>{g('format', 'FORMAT')}</div>
              <div className={styles.chipRow}>
                {FORMATS.map(f => (
                  <button key={f} className={`${styles.chip} ${format === f ? styles.chipOn : ''}`} onClick={() => setFormat(f)}>
                    {g('formats.' + f, f)}
                  </button>
                ))}
              </div>
              <div className={styles.panelLabel}>{g('formation', 'FORMATION')}</div>
              <div className={styles.chipGrid}>
                {FORMATION_KEYS.map(k => (
                  <button key={k} className={`${styles.chip} ${formationKey === k ? styles.chipOn : ''}`} onClick={() => setFormationKey(k)}>{k}</button>
                ))}
              </div>
              <div className={styles.panelLabel}>{g('style', 'STYLE')}</div>
              <div className={styles.chipRow}>
                {STYLES.map(s => (
                  <button key={s} className={`${styles.chip} ${style === s ? styles.chipOn : ''}`} onClick={() => setStyle(s)}>{g('styles.' + s, s)}</button>
                ))}
              </div>
              <div className={styles.panelLabel}>{g('mode', 'DIFFICULTY')}</div>
              <div className={styles.chipRow}>
                {MODES.map(m => (
                  <button key={m} className={`${styles.chip} ${mode === m ? styles.chipOn : ''}`} onClick={() => setMode(m)}>{g('modes.' + m, m)}</button>
                ))}
              </div>
            </div>
            <div className={styles.drawHint}>
              {source === 'All-Stars'
                ? g('rollHintAllStars', 'Roll a world All-Stars pool, then build the greatest cross-nation XI ever — chemistry rewards stacking countrymen together.')
                : g('rollHint', 'Roll to draw a national team and a World Cup edition — modern squads and legendary winners.')}
              {format === 'Gauntlet' && ' ' + g('gauntletHint', 'Gauntlet: one dream team must win four knockout rounds to lift the trophy.')}
            </div>
            <button className={styles.rollBtn} onClick={onRoll}>{g('roll', 'ROLL')} 🎲</button>
          </>
        ) : (
          <>
            <div className={styles.drawCard}>
              <div className={styles.drawnLabel}>{g('drawn', 'DRAWN')}</div>
              <div className={styles.drawnTeam}>
                <span className={styles.flag}>{drawn.allStars ? '🌍' : team?.flag}</span> {drawnTitle}
              </div>
              <div className={styles.drawnCup}>
                {drawn.allStars
                  ? g('crossNation', 'Cross-nation legends')
                  : `${g('cup', 'World Cup')} ${drawn.edition}`}
                {format === 'Gauntlet' && ` · ${g('formats.Gauntlet', 'Gauntlet')}`}
              </div>
            </div>

            <div className={styles.rerollWrap}>
              <div className={styles.rerollLabel}>{g('rerollLabel', 'Re-roll')} · {rerolls} {g('left', 'left')}</div>
              <div className={styles.rerollBtns}>
                {source === 'All-Stars' ? (
                  <button className={styles.rerollBtn} disabled={rerolls <= 0} onClick={() => reroll('team')}>↻ {g('anotherPool', 'New pool')}</button>
                ) : (
                  <>
                    <button className={styles.rerollBtn} disabled={rerolls <= 0} onClick={() => reroll('team')}>↻ {g('anotherTeam', 'Another team')}</button>
                    <button className={styles.rerollBtn} disabled={rerolls <= 0} onClick={() => reroll('cup')}>↻ {g('anotherCup', 'Another cup')}</button>
                  </>
                )}
              </div>
            </div>

            <div className={styles.toolRow}>
              <button className={styles.toolBtn} onClick={autoFill}>✨ {g('autoFill', 'Auto-fill best')}</button>
              <button className={styles.toolBtn} onClick={clearLineup}>✕ {g('clear', 'Clear')}</button>
            </div>

            {liveChem != null && (
              <div className={styles.chemLive}>
                <span>{g('chemistry', 'CHEMISTRY')}</span>
                <div className={styles.chemTrack}><div className={styles.chemFill} style={{ width: `${liveChem}%` }} /></div>
                <span className={styles.chemVal}>{liveChem}</span>
              </div>
            )}

            <div className={styles.pickLabel}>{g('pickPlayer', 'PICK A PLAYER')} <span className={styles.pickCount}>{filledCount}/11</span></div>
            <div className={styles.playerList}>
              {squad.map((p, i) => {
                const used = usedNs.has(playerKey(p));
                const sel = inHand === i;
                return (
                  <button
                    key={i}
                    className={`${styles.playerRow} ${used ? styles.playerUsed : ''} ${sel ? styles.playerSel : ''}`}
                    onClick={() => pickPlayer(i)}
                    disabled={used}
                  >
                    {useChem && <span className={styles.pFlag}>{p.flag}</span>}
                    <span className={styles.pName}>{p.name}</span>
                    <span className={styles.pPos}>{p.pos.join('/')}</span>
                    <span className={styles.pRating}>{mode === 'From memory' && !used ? '?' : p.rating}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ============ CENTER: pitch ============ */}
      <div className={styles.center}>
        {format === 'Gauntlet' && drawn && (
          <div className={styles.bracket}>
            {GAUNTLET_ROUNDS.map((r, i) => {
              const res = gauntlet?.results?.[i];
              const cur = gauntlet?.status === 'playing' && gauntlet?.round === i;
              return (
                <div key={r.key} className={`${styles.bracketStep} ${res ? (res.win ? styles.bracketWin : styles.bracketLoss) : ''} ${cur ? styles.bracketCur : ''}`}>
                  <span className={styles.bracketName}>{g('rounds.' + r.key, r.key)}</span>
                  <span className={styles.bracketScore}>{res ? `${res.goalsFor}–${res.goalsAgainst}` : '·'}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.pitch}>
          <div className={styles.pitchLines} aria-hidden />
          {slots.map((s, i) => {
            const cell = lineup[i];
            const elig = eligibleSlots.has(i) && !cell;
            const eligSwap = eligibleSlots.has(i) && cell;
            return (
              <button
                key={s.id}
                className={`${styles.slot} ${cell ? styles.slotFilled : ''} ${elig ? styles.slotElig : ''} ${eligSwap ? styles.slotEligSwap : ''}`}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                onClick={() => clickSlot(i)}
              >
                {cell ? (
                  <>
                    {useChem && <span className={styles.slotFlag}>{cell.player.flag}</span>}
                    <span className={styles.slotName}>{cell.player.name}</span>
                    <span className={styles.slotMeta}>{cell.fit < 1 ? '~' : ''}{cell.player.rating}</span>
                  </>
                ) : (
                  <span className={styles.slotPos}>{s.pos}</span>
                )}
              </button>
            );
          })}
        </div>

        {drawn && (
          <div className={styles.actionBar}>
            {result?.gauntletEnd === 'advance' ? (
              <button className={styles.playAgainBtn} onClick={advanceRound}>
                ➤ {g('advance', 'Advance')}: {g('rounds.' + GAUNTLET_ROUNDS[result.round + 1].key, GAUNTLET_ROUNDS[result.round + 1].key)}
              </button>
            ) : result ? (
              <button className={styles.playAgainBtn} onClick={onRoll}>🎲 {g('playAgain', 'Play again')}</button>
            ) : (
              <button className={styles.simBtn} disabled={filledCount < 11} onClick={onSimulate}>
                {filledCount < 11
                  ? `${g('fillToSim', 'Fill all 11 to play')} (${filledCount}/11)`
                  : format === 'Gauntlet'
                    ? `▶ ${g('playRound', 'Play')} ${g('rounds.' + GAUNTLET_ROUNDS[gauntlet?.round ?? 0].key, '')}`
                    : `▶ ${g('simulate', 'Simulate match')}`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============ RIGHT: box score / result ============ */}
      <div className={styles.right}>
        {result ? (
          <ResultCard t={t} g={g} result={result} stats={stats} useChem={useChem} format={format} gauntlet={gauntlet} />
        ) : (
          <div className={styles.boxScore}>
            <div className={styles.boxHead}>{g('boxScore', 'LINE-UP')} · {filledCount}/11</div>
            <div className={styles.boxList}>
              {slots.map((s, i) => (
                <div key={s.id} className={styles.boxRow}>
                  <span className={styles.boxPos}>{s.pos}</span>
                  <span className={styles.boxName}>
                    {useChem && lineup[i]?.player ? lineup[i].player.flag + ' ' : ''}
                    {lineup[i]?.player?.name || '—'}
                  </span>
                  <span className={styles.boxRate}>{lineup[i]?.player ? (mode === 'From memory' ? '?' : lineup[i].player.rating) : ''}</span>
                </div>
              ))}
            </div>
            <div className={styles.rulesNote}>
              {useChem
                ? g('rulesAllStars', 'All-Stars: any nation, any era. Stack countrymen next to each other for chemistry — a flawless, well-linked dream team wins 7–0.')
                : g('rules', 'A perfect dream team wins 7–0. Out-of-position players (~) lose rating. Pick a tactical style and chase the flawless score.')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function defaultVerdict(k) {
  return {
    perfect: 'PERFECT 7–0! 🏆',
    demolition: 'Demolition 💥',
    rout: 'Statement win',
    win: 'You win ✅',
    draw: 'Honours even',
    loss: 'Knocked out',
  }[k] || '';
}

function Bar({ label, value, cls }) {
  return (
    <div className={styles.barWrap}>
      <div className={styles.barTop}><span>{label}</span><span>{value}</span></div>
      <div className={styles.barTrack}><div className={`${styles.barFill} ${cls}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function ResultCard({ t, g, result, stats, useChem, format, gauntlet }) {
  const champion = result.gauntletEnd === 'champion';
  const eliminated = result.gauntletEnd === 'out';

  return (
    <div className={styles.resultCard}>
      {champion ? (
        <div className={styles.championBanner}>🏆 {g('champion', 'CHAMPIONS!')}</div>
      ) : eliminated ? (
        <div className={styles.eliminatedBanner}>{g('eliminated', 'Knocked out')}</div>
      ) : null}

      <div className={`${styles.score} ${result.perfect ? styles.scorePerfect : ''}`}>
        {result.goalsFor}<span className={styles.scoreSep}>–</span>{result.goalsAgainst}
      </div>
      <div className={styles.verdict}>{g('verdict.' + verdictKey(result), defaultVerdict(verdictKey(result)))}</div>

      <div className={styles.bars}>
        <Bar label={g('attack', 'ATTACK')} value={result.attack} cls={styles.barAtk} />
        <Bar label={g('defense', 'DEFENSE')} value={result.defense} cls={styles.barDef} />
        {useChem && <Bar label={g('chemistry', 'CHEMISTRY')} value={result.chem} cls={styles.barChem} />}
        <Bar label={g('overall', 'OVERALL')} value={result.overall} cls={styles.barOvr} />
      </div>

      {format === 'Gauntlet' && gauntlet?.results?.length > 0 && (
        <div className={styles.runList}>
          {gauntlet.results.map((r, i) => (
            <div key={i} className={styles.runRow}>
              <span>{g('rounds.' + r.roundKey, r.roundKey)}</span>
              <span className={r.win ? styles.runWin : styles.runLoss}>{r.goalsFor}–{r.goalsAgainst}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.statsRow}>
        <span>🏆 {stats.perfects} {g('perfects', '7-0s')}</span>
        {format === 'Gauntlet' && <span>🥇 {stats.champions} {g('titles', 'titles')}</span>}
        <span>🔥 {stats.streak} {g('streak', 'streak')}</span>
      </div>
    </div>
  );
}
