import styles from '../page.module.css';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import FilterGame from '../Components/FilterGame';
import GameWithSidebarAds from '../Components/GameWithSidebarAds';
import SeoSections from '../Components/SeoSections';
import RelatedLinks from '../Components/RelatedLinks';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata('filter', '/82-0-filter');
}

export default async function FilterPage({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  // Merge per-field so partial translations inherit the English long-form
  // sections until they're localized.
  const page = { ...en.pages.filter, ...(t.pages.filter || {}) };
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
            <FilterGame t={t} />
          </GameWithSidebarAds>
        </section>

        <SeoSections sections={page.sections} />

        <RelatedLinks
          title={t.footer?.related || 'Related guides'}
          links={[
            { href: `${prefix}/82-0-cap-mode`, label: (t.pages.capMode || en.pages.capMode).h1 },
            { href: `${prefix}/82-0-no-mvps`, label: (t.pages.noMvps || en.pages.noMvps).h1 },
            { href: `${prefix}/82-0-one-team`, label: (t.pages.oneTeam || en.pages.oneTeam).h1 },
            { href: `${prefix}/82-0-one-decade`, label: (t.pages.oneDecade || en.pages.oneDecade).h1 },
            { href: `${prefix}/82-0-hard-mode`, label: (t.pages.hardMode || en.pages.hardMode).h1 },
          ]}
        />

      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
