import Link from 'next/link';
import styles from '../page.module.css';

// Homepage "82-0 Game Modes" entry point under the game. Salary Cap is the
// featured hero card (strongest orange CTA); the other four sit in a grid;
// the challenge-filter hub is a lighter text link. Names come from the
// localized cap-variant labels; punchy copy lives in t.homeModes.
export default function MoreModes({ t, prefix = '' }) {
  const hm = t?.homeModes || {};
  const v = t?.game?.cap?.variants || {};
  const play = t?.pages?.filter?.play || 'Play';

  const grid = [
    { href: `${prefix}/82-0-no-mvps`, icon: '🚫', name: v.noMvps || 'No MVPs', desc: hm.noMvpsDesc || 'No superstars. Win it all with role players.' },
    { href: `${prefix}/82-0-one-team`, icon: '🏟️', name: v.oneFranchise || 'One Franchise', desc: hm.oneTeamDesc || 'One club, every era. Go undefeated alone.' },
    { href: `${prefix}/82-0-one-decade`, icon: '📅', name: v.oneDecade || 'One Decade', desc: hm.oneDecadeDesc || 'Lock to one era and chase perfection.' },
    { href: `${prefix}/82-0-hard-mode`, icon: '🔥', name: v.hard || 'Hard Mode', desc: hm.hardDesc || 'Steeper curve. Only the elite survive 82-0.' },
  ];

  return (
    <section className={styles.modesSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>{hm.title || '82-0 Game Modes'}</h2>
        <p className={styles.modesSub}>{hm.subtitle || 'Same perfect-season chase — five ways to play.'}</p>

        {/* Featured: Salary Cap gauntlet */}
        <Link href={`${prefix}/82-0-cap-mode`} className={styles.modeFeature}>
          <span className={styles.featureIcon}>💰</span>
          <span className={styles.featureBody}>
            <span className={styles.featureName}>{v.cap || 'Salary Cap'}</span>
            <span className={styles.featureDesc}>
              {hm.capDesc || 'The gauntlet — build under a budget that tightens with every 82-0. How deep can you go?'}
            </span>
          </span>
          <span className={styles.featureCta}>{play} →</span>
        </Link>

        {/* The other four modes */}
        <div className={styles.modesGrid}>
          {grid.map(c => (
            <Link key={c.href} href={c.href} className={styles.modeCard}>
              <span className={styles.modeIcon}>{c.icon}</span>
              <span className={styles.modeName}>{c.name}</span>
              <span className={styles.modeDesc}>{c.desc}</span>
              <span className={styles.modeArrow} aria-hidden="true">→</span>
            </Link>
          ))}
        </div>

        {/* Hub link — lighter weight */}
        <Link href={`${prefix}/82-0-filter`} className={styles.modesAllLink}>
          {hm.all || 'Browse all challenge filters'} →
        </Link>
      </div>
    </section>
  );
}
