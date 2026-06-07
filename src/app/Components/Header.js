'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { useTranslations } from '@/hooks/useTranslations';

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const currentLang = params?.lang || 'en';
  const { t } = useTranslations();
  // English canonical URLs are locale-less — link to root paths.
  const prefix = currentLang === 'en' ? '' : `/${currentLang}`;

  const LOCALES = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de'];

  const changeLanguage = (newLocale) => {
    const segments = pathname.split('/');
    // Strip any existing locale prefix
    if (LOCALES.includes(segments[1])) segments.splice(1, 1);
    // English lives at the locale-less root paths
    if (newLocale !== 'en') segments.splice(1, 0, newLocale);
    router.push(segments.join('/') || '/');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href={prefix || '/'} className={styles.logoLink}>
          <Image src="/logo-site.png" alt="82-0 Challenge logo" width={28} height={28} className={styles.logoImg} />
          <span className={styles.logoText}>{t?.header?.siteName || '82-0 Challenge'}</span>
        </Link>

        <button
          className={styles.mobileMenuToggle}
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isNavOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 12h18" />
                <path d="M3 6h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>

        <nav className={`${styles.mainNav} ${isNavOpen ? styles.open : ''}`}>
          <Link href={prefix || '/'} className={styles.navLink} onClick={() => setIsNavOpen(false)}>
            {t?.header?.home || 'Home'}
          </Link>
          <Link href={`${prefix}/82-0`} className={styles.navLink} onClick={() => setIsNavOpen(false)}>
            {t?.header?.whatIs || 'What Is 82-0?'}
          </Link>
          <Link href={`${prefix}/how-to-play`} className={styles.navLink} onClick={() => setIsNavOpen(false)}>
            {t?.header?.howToPlay || 'How to Play'}
          </Link>
          <Link href={`${prefix}/team-builder`} className={styles.navLink} onClick={() => setIsNavOpen(false)}>
            {t?.header?.teamBuilder || 'Team Builder'}
          </Link>
          <Link href={`${prefix}/daily`} className={styles.navLink} onClick={() => setIsNavOpen(false)}>
            🗓️ {t?.footer?.daily || 'Daily'}
          </Link>
          <Link href={`${prefix}/20-0`} className={`${styles.navLink} ${styles.navLinkNfl}`} onClick={() => setIsNavOpen(false)}>
            🏈 20-0
          </Link>
          <Link href={`${prefix}/38-0`} className={`${styles.navLink} ${styles.navLinkNfl}`} onClick={() => setIsNavOpen(false)}>
            ⚽ 38-0
          </Link>
        </nav>

        <div className={styles.langSwitcher}>
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            defaultValue={currentLang}
            className={styles.langSelect}
          >
            <option value="en">EN</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="es">ES</option>
            <option value="fr">FR</option>
            <option value="de">DE</option>
          </select>
        </div>
      </div>
    </header>
  );
}
