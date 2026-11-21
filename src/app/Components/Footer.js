import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = ({ t, lang = 'en' }) => {
  // English canonical URLs are locale-less — link to root paths.
  const prefix = lang === 'en' ? '' : `/${lang}`;
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <div className={styles.footerSection}>
          <h3>{t?.footer?.pages || 'Pages'}</h3>
          <Link href={prefix || '/'}>{t?.header?.home || 'Home'}</Link>
          <Link href={`${prefix}/82-0`}>{t?.header?.whatIs || 'What Is 82-0?'}</Link>
          <Link href={`${prefix}/how-to-play`}>{t?.header?.howToPlay || 'How to Play'}</Link>
          <Link href={`${prefix}/how-its-calculated`}>{t?.footer?.howItsCalculated || "How It's Calculated"}</Link>
          <Link href={`${prefix}/can-you-go-82-0`}>{t?.footer?.canYouGo || 'Can You Go 82-0?'}</Link>
          <Link href={`${prefix}/best-82-0-team`}>{t?.footer?.bestTeam || 'Best 82-0 Team'}</Link>
          <Link href={`${prefix}/how-to-beat-82-0`}>{t?.footer?.howToBeat || 'How to Beat 82-0'}</Link>
          <Link href={`${prefix}/games-like-82-0`}>{t?.footer?.gamesLike || 'Games Like 82-0'}</Link>
          <Link href={`${prefix}/unblocked`}>{t?.footer?.unblocked || 'Play Unblocked'}</Link>
          <Link href={`${prefix}/team-builder`}>{t?.header?.teamBuilder || 'Team Builder'}</Link>
          <Link href={`${prefix}/leaderboard`}>{t?.footer?.leaderboard || 'Leaderboard'}</Link>
          <Link href={`${prefix}/daily`}>{t?.footer?.daily || 'Daily Challenge'}</Link>
        </div>

        <div className={styles.footerSection}>
          <h3>{t?.footer?.moreGames || 'More Games'}</h3>
          <Link href={`${prefix}/82-0-nhl`}>{t?.footer?.nhl || '82-0 NHL (Hockey)'}</Link>
          <Link href={`${prefix}/82-0-soccer`}>{t?.footer?.soccerAlias || '82-0 Soccer'}</Link>
          <Link href={`${prefix}/82-0-baseball`}>{t?.footer?.baseballAlias || '82-0 Baseball'}</Link>
          <Link href={`${prefix}/82-0-football`}>{t?.footer?.footballAlias || '82-0 Football'}</Link>
          <Link href={`${prefix}/16-0`}>{t?.footer?.sixteenZero || '16-0 Challenge (NFL)'}</Link>
          <Link href={`${prefix}/17-0`}>{t?.footer?.seventeenZero || '17-0 Challenge (NFL)'}</Link>
          <Link href={`${prefix}/20-0`}>{t?.footer?.twentyZero || '20-0 Challenge (NFL)'}</Link>
          <Link href={`${prefix}/38-0`}>{t?.footer?.thirtyEight || '38-0 (Premier League)'}</Link>
          <Link href={`${prefix}/7-0`}>{t?.footer?.sevenZero || '7-0 (World Cup)'}</Link>
          <Link href={`${prefix}/162-0`}>{t?.footer?.baseball162 || '162-0 (Baseball)'}</Link>
          <Link href={`${prefix}/72-0`}>{t?.footer?.seventyTwo || '72-0 Challenge'}</Link>
          <Link href={`${prefix}/82-0-for-other-sports`}>{t?.footer?.otherSports || 'Other Sports'}</Link>
        </div>

        <div className={styles.footerSection}>
          <h3>{t?.footer?.otherSites || 'Our Other Games'}</h3>
          <a href="https://73-9-game.com" target="_blank" rel="noopener">🏀 73-9 Game (NBA)</a>
          <a href="https://17-0-game.com" target="_blank" rel="noopener">🏈 17-0 Game (NFL)</a>
          <a href="https://38-0-game.com" target="_blank" rel="noopener">⚽ 38-0 Game (Soccer)</a>
          <a href="https://7-0-game.com" target="_blank" rel="noopener">🌎 7-0 Game (World Cup)</a>
          <a href="https://23-0-game.com" target="_blank" rel="noopener">🏉 23-0 Game (AFL)</a>
          <a href="https://27-0-game.com" target="_blank" rel="noopener">🏉 27-0 Game (NRL)</a>
        </div>

        <div className={styles.footerSection}>
          <h3>{t?.footer?.legal || 'Legal'}</h3>
          <Link href={`${prefix}/about`}>{t?.footer?.about || 'About'}</Link>
          <Link href={`${prefix}/privacy`}>{t?.footer?.privacy || 'Privacy Policy'}</Link>
          <Link href={`${prefix}/terms`}>{t?.footer?.terms || 'Terms of Use'}</Link>
        </div>

        <div className={styles.footerSection}>
          <h3>{t?.footer?.contact || 'Contact'}</h3>
          <a href="https://t.me/+44Oq47usijFhM2I5" target="_blank" rel="noopener noreferrer">
            💬 {t?.footer?.community || 'Join our Telegram community'}
          </a>
          <a href="mailto:contact@82-0-challenge.com">
            contact@82-0-challenge.com
          </a>
          <a href="https://ko-fi.com/codagames" target="_blank" rel="noopener noreferrer">
            ☕ {t?.footer?.support || 'Support the developer'}
          </a>
        </div>
      </div>

      <div className={styles.footerDesc}>
        <p>{t?.footer?.disclaimer || 'Player names and historical statistics are presented for informational and game-simulation purposes only. This is an independent fan-made project, not affiliated with, endorsed by, or sponsored by the NBA, any professional basketball league, team, or player.'}</p>
      </div>

      <div className={styles.copyright}>
        {t?.footer?.copyright || '© 2026 82-0 Challenge'}
      </div>
    </footer>
  );
};

export default Footer;
