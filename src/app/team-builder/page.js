import styles from '../page.module.css';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import GameMain from '../Components/Game/GameMain';
import GameWithSidebarAds from '../Components/GameWithSidebarAds';
import SeoSections from '../Components/SeoSections';
import SquadCta from '../Components/SquadCta';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata('teamBuilder', '/team-builder');
}

export default async function TeamBuilder({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const page = t.pages.teamBuilder;

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
            <GameMain t={t} />
          </GameWithSidebarAds>
        </section>

        <SeoSections sections={page.sections} />
        <SquadCta t={t} />
      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
