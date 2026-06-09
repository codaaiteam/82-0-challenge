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
          <Link href={`${prefix}/team-builder`}>{t?.header?.teamBuilder || 'Team Builder'}</Link>
          <Link href={`${prefix}/daily`}>{t?.footer?.daily || 'Daily Challenge'}</Link>
          <Link href={`${prefix}/20-0`}>{t?.footer?.twentyZero || '20-0 Challenge (NFL)'}</Link>
          <Link href={`${prefix}/38-0`}>{t?.footer?.thirtyEight || '38-0 Challenge (Premier League)'}</Link>
        </div>

        <div className={styles.footerSection}>
          <h3>{t?.footer?.more || 'More'}</h3>
          <a href="https://38-0-game.com" target="_blank" rel="noopener">38-0 Game — Premier League XI</a>
          <a href="https://c2story.com" target="_blank" rel="noopener noreferrer">
            {t?.cta?.button || 'AI Character Squad Builder'}
          </a>
          <a href="https://ko-fi.com/codagames" target="_blank" rel="noopener noreferrer">
            ☕ {t?.footer?.support || 'Support the developer'}
          </a>
        </div>

        <div className={styles.footerSection}>
          <h3>{t?.footer?.legal || 'Legal'}</h3>
          <Link href={`${prefix}/about`}>{t?.footer?.about || 'About'}</Link>
          <Link href={`${prefix}/privacy`}>{t?.footer?.privacy || 'Privacy Policy'}</Link>
          <Link href={`${prefix}/terms`}>{t?.footer?.terms || 'Terms of Use'}</Link>
        </div>

        <div className={styles.footerSection}>
          <h3>{t?.footer?.contact || 'Contact'}</h3>
          <a href="mailto:contact@82-0-challenge.com">
            contact@82-0-challenge.com
          </a>
        </div>
      </div>

      <div className={styles.footerDesc}>
        <p>{t?.footer?.disclaimer || 'This is an independent fan-made style team builder game. It is not affiliated with, endorsed by, or sponsored by the NBA or any professional basketball league. All player archetypes are fictional.'}</p>
      </div>

      <div className={styles.copyright}>
        {t?.footer?.copyright || '© 2026 82-0 Challenge'}
      </div>
    </footer>
  );
};

export default Footer;
