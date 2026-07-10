import Link from 'next/link';
import styles from '../page.module.css';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import SeoSections from '../Components/SeoSections';
import RelatedLinks from '../Components/RelatedLinks';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata('whatIs', '/82-0');
}

// Concept/history article — the game itself lives on the home page. Keeping
// this page article-only gives it a distinct search purpose instead of
// competing with / for the same "play the game" intent.
export default async function WhatIs820({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const page = t.pages.whatIs || en.pages.whatIs;
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <>
      <Header />
      <main className={styles.mainContent}>
        <section className={styles.pageHero}>
          <div className={styles.container}>
            <h1 className={styles.pageTitle}>{page.h1}</h1>
            <p className={styles.pageIntro}>{page.intro}</p>
            <div className={styles.centerCta}>
              <Link href={`${prefix}/#game`} className={styles.heroCta}>
                {page.playCta || en.pages.whatIs.playCta}
              </Link>
            </div>
          </div>
        </section>

        <SeoSections sections={page.sections} />

        <RelatedLinks
          title={t.footer?.related || 'Related guides'}
          links={[
            { href: `${prefix}/how-its-calculated`, label: (t.pages.howItsCalculated || en.pages.howItsCalculated).h1 },
            { href: `${prefix}/can-you-go-82-0`, label: (t.pages.canYouGo || en.pages.canYouGo).h1 },
            { href: `${prefix}/how-to-play`, label: (t.pages.howToPlay || en.pages.howToPlay).h1 },
          ]}
        />

        <section className={styles.howtoSection}>
          <div className={styles.container}>
            <div className={styles.centerCta}>
              <Link href={`${prefix}/#game`} className={styles.heroCta}>
                {page.playCta || en.pages.whatIs.playCta}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
