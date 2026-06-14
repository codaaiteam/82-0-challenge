import Link from 'next/link';
import styles from '../page.module.css';

// Homepage entry point to the newer 82-0 modes, shown right under the game.
// Names come from the cap variant labels and descriptions from the filter
// definitions, so this stays localized with the rest of the site.
export default function MoreModes({ t, prefix = '' }) {
  const hm = t?.homeModes || {};
  const v = t?.game?.cap?.variants || {};
  const f = t?.pages?.filter?.filters || {};
  const play = t?.pages?.filter?.play || 'Play';

  const cards = [
    { href: `${prefix}/82-0-cap-mode`, icon: '💰', name: v.cap || 'Salary Cap', desc: f.cap?.desc },
    { href: `${prefix}/82-0-no-mvps`, icon: '🚫', name: v.noMvps || 'No MVPs', desc: f.noMvps?.desc },
    { href: `${prefix}/82-0-one-team`, icon: '🏟️', name: v.oneFranchise || 'One Franchise', desc: f.oneFranchise?.desc },
    { href: `${prefix}/82-0-one-decade`, icon: '📅', name: v.oneDecade || 'One Decade', desc: f.oneDecade?.desc },
    { href: `${prefix}/82-0-hard-mode`, icon: '🔥', name: v.hard || 'Hard Mode', desc: f.hard?.desc },
    { href: `${prefix}/82-0-filter`, icon: '🎯', name: hm.all || 'All Challenges', desc: hm.allDesc || 'Cap, No MVPs, One Franchise and more — pick a filter.' },
  ];

  return (
    <section className={styles.modesSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>{hm.title || 'More ways to play 82-0'}</h2>
        <p className={styles.modesSub}>
          {hm.subtitle || 'Beyond the classic draft — take on the salary-cap gauntlet and the challenge filters.'}
        </p>
        <div className={styles.modesGrid}>
          {cards.map(c => (
            <Link key={c.href} href={c.href} className={styles.modeCard}>
              <span className={styles.modeIcon}>{c.icon}</span>
              <span className={styles.modeName}>{c.name}</span>
              <span className={styles.modeDesc}>{c.desc}</span>
              <span className={styles.modePlay}>{play} →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
