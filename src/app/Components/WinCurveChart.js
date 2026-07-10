import styles from '../page.module.css';

// Inline SVG chart: probability of sweeping all 82 games (y = p^82) against
// per-game win probability (x, 90%..100%). Server-rendered — no client JS.
const W = 720;
const H = 380;
const PAD = { top: 28, right: 24, bottom: 52, left: 64 };
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top - PAD.bottom;

const px = p => PAD.left + ((p - 0.9) / 0.1) * PW;
const py = v => PAD.top + (1 - v) * PH;

function curvePath() {
  const pts = [];
  for (let p = 0.9; p <= 1.0001; p += 0.0025) {
    pts.push(`${px(Math.min(p, 1)).toFixed(1)},${py(Math.pow(Math.min(p, 1), 82)).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
}

// Reference points called out on the curve.
const MARKS = [
  { p: 0.95, label: '95% → 1.5%' },
  { p: 0.99, label: '99% → 44%' },
];

export default function WinCurveChart({ t }) {
  const fig = t.homeFigures || {};
  const xTicks = [0.9, 0.92, 0.94, 0.96, 0.98, 1.0];
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <figure className={styles.seoFigure}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={fig.curveAlt}
        className={styles.curveSvg}
      >
        {/* grid + axis labels */}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={PAD.left} y1={py(v)} x2={W - PAD.right} y2={py(v)}
              stroke="var(--border-color)" strokeWidth="1" strokeDasharray={v === 0 ? '' : '4 6'} />
            <text x={PAD.left - 10} y={py(v) + 4} textAnchor="end" fontSize="13"
              fill="var(--text-muted)">{Math.round(v * 100)}%</text>
          </g>
        ))}
        {xTicks.map(p => (
          <text key={p} x={px(p)} y={H - PAD.bottom + 22} textAnchor="middle" fontSize="13"
            fill="var(--text-muted)">{Math.round(p * 100)}%</text>
        ))}
        <text x={PAD.left + PW / 2} y={H - 8} textAnchor="middle" fontSize="13.5"
          fill="var(--text-secondary)">{fig.curveX}</text>
        <text x={16} y={PAD.top - 10} fontSize="13.5" fill="var(--text-secondary)">{fig.curveY}</text>

        {/* the curve */}
        <path d={curvePath()} fill="none" stroke="var(--accent)" strokeWidth="3" />

        {/* callout points */}
        {MARKS.map(m => {
          const v = Math.pow(m.p, 82);
          return (
            <g key={m.p}>
              <circle cx={px(m.p)} cy={py(v)} r="5" fill="var(--accent)" />
              <text x={px(m.p) - 8} y={py(v) - 12} textAnchor="end" fontSize="13.5" fontWeight="700"
                fill="var(--text-primary)">{m.label}</text>
            </g>
          );
        })}
      </svg>
      {fig.curveCaption && <figcaption className={styles.seoFigureCap}>{fig.curveCaption}</figcaption>}
    </figure>
  );
}
