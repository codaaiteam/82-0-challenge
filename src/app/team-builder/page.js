import Link from 'next/link';
import styles from '../page.module.css';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import TeamBuilderTool from '../Components/TeamBuilderTool';
import SeoSections from '../Components/SeoSections';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata('teamBuilder', '/team-builder');
}

// Unlike the home-page challenge (random spins), this is the free-pick
// sandbox: browse the whole player pool, build any five, simulate. No
// leaderboard submission — competitive modes keep their balance.
export default async function TeamBuilder({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const page = t.pages.teamBuilder || en.pages.teamBuilder;
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

        <section id="builder" className={styles.gameSection}>
          <TeamBuilderTool t={t} />
        </section>

        <SeoSections sections={page.sections} />

        <section className={styles.howtoSection}>
          <div className={styles.container}>
            <div className={styles.centerCta}>
              <Link href={`${prefix}/#game`} className={styles.heroCta}>
                {t.tb?.playReal || en.tb.playReal}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
