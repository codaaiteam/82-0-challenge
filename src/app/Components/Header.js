'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { useTranslations } from '@/hooks/useTranslations';

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // '820' | 'more' | null
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const currentLang = params?.lang || 'en';
  const { t } = useTranslations();
  const navRef = useRef(null);
  // English canonical URLs are locale-less — link to root paths.
  const prefix = currentLang === 'en' ? '' : `/${currentLang}`;

  const LOCALES = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];
  const h = t?.header || {};

  // The 82-0 family lives under one dropdown; other perfect-season games under
  // a second. Keeps the bar uncluttered as the family of modes grows.
  // The 82-0 family lives under one dropdown; the other perfect-season games
  // and the leaderboard sit flat alongside it.
  const family = [
    { href: `${prefix}/#game`, label: `🏀 ${h.play || 'Play 82-0'}` },
    { href: `${prefix}/82-0-cap-mode`, label: `💰 ${h.capMode || '82-0 Salary Cap Mode'}` },
    { href: `${prefix}/82-0-filter`, label: `🎯 ${h.challenges || '82-0 Challenge'}` },
    { href: `${prefix}/82-0-no-mvps`, label: h.navNoMvps || 'No MVPs', sub: true },
    { href: `${prefix}/82-0-one-team`, label: h.navOneTeam || 'One Franchise', sub: true },
    { href: `${prefix}/82-0-one-decade`, label: h.navOneDecade || 'One Decade', sub: true },
    { href: `${prefix}/82-0-era-mode`, label: h.navEraMode || 'Era Mode', sub: true },
    { href: `${prefix}/82-0-lebron`, label: h.navLebron || 'LeBron Mode', sub: true },
    { href: `${prefix}/82-0-hard-mode`, label: h.navHardMode || 'Hard Mode', sub: true },
    { href: `${prefix}/team-builder`, label: h.teamBuilder || 'Team Builder' },
    { href: `${prefix}/82-0`, label: h.whatIs || 'What Is 82-0?' },
    { href: `${prefix}/how-to-play`, label: h.howToPlay || 'How to Play' },
  ];
  const otherGames = [
    { href: `${prefix}/82-0-nhl`, label: '🏒 82-0 NHL' },
    { href: `${prefix}/17-0`, label: '🏈 17-0' },
    { href: `${prefix}/20-0`, label: '🏈 20-0' },
    { href: `${prefix}/38-0`, label: '⚽ 38-0' },
    { href: `${prefix}/7-0`, label: '🌎 7-0' },
    { href: `${prefix}/162-0`, label: '⚾ 162-0' },
  ];

  const changeLanguage = (newLocale) => {
    const segments = pathname.split('/');
    if (LOCALES.includes(segments[1])) segments.splice(1, 1);
    if (newLocale !== 'en') segments.splice(1, 0, newLocale);
    router.push(segments.join('/') || '/');
  };

  const closeAll = () => { setOpenMenu(null); setIsNavOpen(false); };

  // Close an open dropdown when clicking outside the nav.
  useEffect(() => {
    if (!openMenu) return;
    const onDoc = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [openMenu]);

  const renderGroup = (id, label, items) => (
    <div className={`${styles.navGroup} ${openMenu === id ? styles.navGroupOpen : ''}`}>
      <button
        type="button"
        className={styles.navTrigger}
        aria-expanded={openMenu === id}
        onClick={() => setOpenMenu(openMenu === id ? null : id)}
      >
        {label} <span className={styles.caret}>▾</span>
      </button>
      <div className={styles.dropdown}>
        {items.map(it => (
          <Link
            key={it.href}
            href={it.href}
            className={`${styles.dropdownItem} ${it.sub ? styles.dropdownSub : ''}`}
            onClick={closeAll}
          >
            {it.sub && <span className={styles.dropdownSubMark}>↳</span>}{it.label}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href={prefix || '/'} className={styles.logoLink}>
          <Image src="/logo-site.png" alt="82-0 Challenge logo" width={28} height={28} className={styles.logoImg} />
          <span className={styles.logoLockup}>
            <span className={styles.logoText}>{h.parentBrand || '82-0 Challenge'}</span>
            <span className={styles.logoTagline}>{h.tagline || 'Perfect record games'}</span>
          </span>
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

        <nav ref={navRef} className={`${styles.mainNav} ${isNavOpen ? styles.open : ''}`}>
          {renderGroup('820', `82-0 ${h.family || 'NBA'}`, family)}
          {/* Daily gets its own top-level slot — it's the retention hook. */}
          <Link href={`${prefix}/daily`} className={styles.navLink} onClick={() => setIsNavOpen(false)}>
            🗓️ {h.daily || 'Daily Run'}
          </Link>
          {otherGames.map(it => (
            <Link key={it.href} href={it.href} className={styles.navLink} onClick={() => setIsNavOpen(false)}>
              {it.label}
            </Link>
          ))}
          <Link href={`${prefix}/leaderboard`} className={styles.navLink} onClick={() => setIsNavOpen(false)}>
            🏆 {h.leaderboard || 'Leaderboard'}
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
            <option value="pt">PT</option>
          </select>
        </div>
      </div>
    </header>
  );
}
