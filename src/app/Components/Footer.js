import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = ({ t, lang = 'en' }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <div className={styles.footerSection}>
          <h3>{t?.footer?.pages || 'Pages'}</h3>
          <Link href={`/${lang}`}>{t?.header?.home || 'Home'}</Link>
          <Link href={`/${lang}/82-0`}>{t?.header?.whatIs || 'What Is 82-0?'}</Link>
          <Link href={`/${lang}/how-to-play`}>{t?.header?.howToPlay || 'How to Play'}</Link>
          <Link href={`/${lang}/team-builder`}>{t?.header?.teamBuilder || 'Team Builder'}</Link>
        </div>

        <div className={styles.footerSection}>
          <h3>{t?.footer?.more || 'More'}</h3>
          <a href="https://c2story.com" target="_blank" rel="noopener noreferrer">
            {t?.cta?.button || 'AI Character Squad Builder'}
          </a>
        </div>

        <div className={styles.footerSection}>
          <h3>{t?.footer?.legal || 'Legal'}</h3>
          <Link href={`/${lang}/privacy`}>{t?.footer?.privacy || 'Privacy Policy'}</Link>
          <Link href={`/${lang}/terms`}>{t?.footer?.terms || 'Terms of Use'}</Link>
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
