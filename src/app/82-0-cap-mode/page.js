import styles from '../page.module.css';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import GameMain from '../Components/Game/GameMain';
import GameWithSidebarAds from '../Components/GameWithSidebarAds';
import SeoSections from '../Components/SeoSections';
import RelatedLinks from '../Components/RelatedLinks';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata('capMode', '/82-0-cap-mode');
}

export default async function CapMode({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  // Merge per-field so partial translations inherit the English long-form
  // sections until they're localized.
  const page = { ...en.pages.capMode, ...(t.pages.capMode || {}) };
  const prefix = locale === 'en' ? '' : `/${locale}`;

  return (
    <>
      <Header />
      <main className={styles.mainContent}>
        <section className={styles.pageHero}>
          <div className={styles.container}>
            <h1 className={styles.pageTitle}>{page.h1}</h1>
            <p className={styles.pageIntro}>{page.intro}</p>
          </div>
        </section>

        <section id="game" className={styles.gameSection}>
          <GameWithSidebarAds>
            <GameMain t={t} variant={{ id: 'cap' }} />
          </GameWithSidebarAds>
        </section>

        <SeoSections sections={page.sections} />

        <RelatedLinks
          title={t.footer?.related || 'Related guides'}
          links={[
            { href: `${prefix}/82-0-filter`, label: (t.pages.filter || en.pages.filter).h1 },
            { href: `${prefix}/how-its-calculated`, label: (t.pages.howItsCalculated || en.pages.howItsCalculated).h1 },
            { href: `${prefix}/leaderboard`, label: (t.pages.leaderboard || en.pages.leaderboard).h1 },
          ]}
        />

      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
