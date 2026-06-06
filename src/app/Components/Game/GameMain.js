'use client'

import { useState, useEffect, useCallback } from 'react';
import styles from './Game.module.css';
import { drawRound } from '@/lib/random';
import { scoreLineup, titleKey, bestPick, weaknessKey } from '@/lib/scoring';

const TOTAL_ROUNDS = 5;
const SITE_URL = 'https://www.82-0-challenge.com';

function fmt(template, vars) {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, v),
    template || ''
  );
}

export default function GameMain({ t }) {
  const g = t?.game || {};
  const [round, setRound] = useState(1);
  const [lineup, setLineup] = useState([]);
  const [current, setCurrent] = useState(null); // { team, era, candidates }
  const [rerollsLeft, setRerollsLeft] = useState(3);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Draw the first round on the client only (avoids SSR hydration mismatch).
  useEffect(() => {
    setCurrent(drawRound([]));
  }, []);

  const pickedIds = lineup.map(p => p.id);

  const handleSelect = (player) => {
    const newLineup = [...lineup, player];
    setLineup(newLineup);
    if (newLineup.length >= TOTAL_ROUNDS) {
      const res = scoreLineup(newLineup);
      setResult({
        ...res,
        title: titleKey(res.wins),
        best: bestPick(newLineup),
        weakness: weaknessKey(newLineup, res),
      });
    } else {
      setRound(round + 1);
      setCurrent(drawRound([...pickedIds, player.id]));
    }
  };

  const handleReroll = () => {
    if (rerollsLeft <= 0) return;
    setRerollsLeft(rerollsLeft - 1);
    setCurrent(drawRound(pickedIds, current));
  };

  const handleRestart = useCallback(() => {
    setRound(1);
    setLineup([]);
    setRerollsLeft(3);
    setResult(null);
    setCopied(false);
    setCurrent(drawRound([]));
  }, []);

  const shareText = result
    ? fmt(g.shareText, { record: `${result.wins}-${result.losses}` })
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${SITE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(SITE_URL)}`;

  // ---- Result screen ----
  if (result) {
    return (
      <div className={styles.game}>
        <div className={styles.resultCard}>
          <div className={styles.resultTitle}>{g.titles?.[result.title]}</div>
          <div className={styles.resultRecord}>{result.wins}–{result.losses}</div>
          <div className={styles.resultLabel}>{g.resultRecord}</div>

          <div className={styles.resultStats}>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>{g.teamRating}</span>
              <span className={styles.resultStatValue}>{result.score}/100</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>{g.bestPick}</span>
              <span className={styles.resultStatValue}>{result.best.name}</span>
            </div>
            <div className={styles.resultStat}>
              <span className={styles.resultStatLabel}>{g.weakness}</span>
              <span className={styles.resultStatValue}>{g.weaknesses?.[result.weakness]}</span>
            </div>
          </div>

          <div className={styles.lineupRecap}>
            {lineup.map(p => (
              <div key={p.id} className={styles.lineupRecapItem}>
                <span className={styles.pos}>{p.position}</span>
                <span>{p.name}</span>
                <span className={styles.ovrBadge}>{p.overall}</span>
              </div>
            ))}
          </div>

          <div className={styles.resultActions}>
            <button className={styles.primaryBtn} onClick={handleRestart}>{g.playAgain}</button>
            <button className={styles.secondaryBtn} onClick={handleCopy}>
              {copied ? g.copied : g.copyResult}
            </button>
            <a className={styles.secondaryBtn} href={xShareUrl} target="_blank" rel="noopener noreferrer">
              {g.shareOnX}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ---- Loading first draw ----
  if (!current) {
    return <div className={styles.game}><div className={styles.loading}>82–0…</div></div>;
  }

  // ---- Picking screen ----
  return (
    <div className={styles.game}>
      <div className={styles.gameHeader}>
        <div className={styles.roundBadge}>{fmt(g.roundOf, { round, total: TOTAL_ROUNDS })}</div>
        <div className={styles.comboBox}>
          <span className={styles.comboTeam}>{current.team}</span>
          <span className={styles.comboEra}>{current.era}</span>
        </div>
        <button
          className={styles.rerollBtn}
          onClick={handleReroll}
          disabled={rerollsLeft <= 0}
        >
          🎲 {g.rerollButton} ({rerollsLeft})
        </button>
      </div>

      <p className={styles.pickPrompt}>{g.pickPrompt}</p>

      <div className={styles.candidates}>
        {current.candidates.map(p => (
          <button key={p.id} className={styles.playerCard} onClick={() => handleSelect(p)}>
            <div className={styles.playerTop}>
              <span className={styles.pos}>{p.position}</span>
              <span className={styles.ovrBadge}>{p.overall}</span>
            </div>
            <div className={styles.playerName}>{p.name}</div>
            <div className={styles.playerStats}>
              <span>{g.off} {p.offense}</span>
              <span>{g.def} {p.defense}</span>
              <span>{g.sht} {p.shooting}</span>
            </div>
            <div className={styles.selectHint}>{g.select}</div>
          </button>
        ))}
      </div>

      <div className={styles.lineupBar}>
        <span className={styles.lineupLabel}>{g.yourLineup}</span>
        <div className={styles.lineupSlots}>
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
            <div key={i} className={`${styles.slot} ${lineup[i] ? styles.slotFilled : ''}`}>
              {lineup[i] ? (
                <>
                  <span className={styles.slotPos}>{lineup[i].position}</span>
                  <span className={styles.slotOvr}>{lineup[i].overall}</span>
                </>
              ) : (
                <span className={styles.slotEmpty}>{i + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
