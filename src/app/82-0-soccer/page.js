import styles from '../page.module.css';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import VariantGame from '../Components/VariantGame';
import GameWithSidebarAds from '../Components/GameWithSidebarAds';
import SeoSections from '../Components/SeoSections';
import RelatedLinks from '../Components/RelatedLinks';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata('soccerMode', '/82-0-soccer');
}

export default async function SoccerMode({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const page = { ...en.pages.soccerMode, ...(t.pages.soccerMode || {}) };
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
            <VariantGame t={t} id="classic" />
          </GameWithSidebarAds>
        </section>

        <SeoSections sections={page.sections} />

        <RelatedLinks
          title={t.footer?.related || 'Related guides'}
          links={[
            { href: `${prefix}/38-0`, label: (t.pages.thirtyEight || en.pages.thirtyEight).h1 },
            { href: `${prefix}/7-0`, label: (t.pages.sevenZero || en.pages.sevenZero).h1 },
            { href: `${prefix}/82-0-for-other-sports`, label: (t.pages.otherSports || en.pages.otherSports).h1 },
          ]}
        />

      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
