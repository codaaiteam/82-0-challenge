// Mini half-court diagram for a playstyle: 5 colored position dots placed at
// the same court spots the live game uses, so each lineup's shape reads at a glance.
import styles from './Game.module.css';

// Court spots (x, y on a 0–100 × 0–90 half-court), matching .courtSpot0–4 in CSS.
const SPOTS = [
  { x: 50, y: 70 },
  { x: 82, y: 56 },
  { x: 18, y: 56 },
  { x: 68, y: 22 },
  { x: 36, y: 22 },
];

export default function MiniCourt({ positions }) {
  return (
    <svg className={styles.miniCourt} viewBox="0 0 100 90" aria-hidden="true">
      {/* court line art (simplified, basket at top) */}
      <g className={styles.miniLines}>
        <path d="M9 1 L9 15 A41 41 0 0 0 91 15 L91 1" />
        <rect x="38" y="1" width="24" height="30" />
        <circle cx="50" cy="31" r="7" />
        <line x1="1" y1="89" x2="99" y2="89" />
      </g>
      <line className={styles.miniRim} x1="43" y1="6" x2="57" y2="6" />
      <circle className={styles.miniRim} cx="50" cy="9" r="2" />
      {/* the five — one team, one jersey color */}
      {positions.map((pos, i) => {
        const s = SPOTS[i];
        return (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r="8.5" className={styles.miniDot} />
            <text x={s.x} y={s.y} className={styles.miniLabel}>{pos}</text>
          </g>
        );
      })}
    </svg>
  );
}
