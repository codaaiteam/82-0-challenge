import styles from '../page.module.css';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import LeaderboardTable from '../Components/LeaderboardTable';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata('leaderboard', '/leaderboard');
}

export default async function Leaderboard({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const page = t.pages?.leaderboard || en.pages.leaderboard;

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

        <section className={styles.gameSection}>
          <LeaderboardTable />
        </section>
      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
