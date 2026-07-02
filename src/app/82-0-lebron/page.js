import styles from '../page.module.css';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import VariantGame from '../Components/VariantGame';
import GameWithSidebarAds from '../Components/GameWithSidebarAds';
import SeoSections from '../Components/SeoSections';
import RelatedLinks from '../Components/RelatedLinks';
import SquadCta from '../Components/SquadCta';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata('lebronMode', '/82-0-lebron');
}

export default async function LebronMode({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const page = { ...en.pages.lebronMode, ...(t.pages.lebronMode || {}) };
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
            <VariantGame t={t} id="lebron" />
          </GameWithSidebarAds>
        </section>

        <SeoSections sections={page.sections} />

        <RelatedLinks
          title={t.footer?.related || 'Related guides'}
          links={[
            { href: `${prefix}/82-0-era-mode`, label: (t.pages.eraMode || en.pages.eraMode).h1 },
            { href: `${prefix}/82-0-no-mvps`, label: (t.pages.noMvps || en.pages.noMvps).h1 },
            { href: `${prefix}/82-0-hard-mode`, label: (t.pages.hardMode || en.pages.hardMode).h1 },
          ]}
        />

        <SquadCta t={t} />
      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
