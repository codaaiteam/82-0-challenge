import Link from 'next/link';
import styles from '../page.module.css';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import QuestionFAQ from '../Components/QuestionFAQ';
import HockeyGame from '../Components/Game/HockeyGame';
import GameWithSidebarAds from '../Components/GameWithSidebarAds';
import SeoSections from '../Components/SeoSections';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata('nhl', '/82-0-nhl');
}

export default async function NhlEightyTwo({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const page = t.pages.nhl || en.pages.nhl;
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

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

        {/* Playable 82-game NHL variant */}
        <section id="game" className={styles.gameSection}>
          <GameWithSidebarAds>
            <HockeyGame t={t} />
          </GameWithSidebarAds>
        </section>

        <SeoSections sections={page.sections} />

        <section className={styles.howtoSection}>
          <div className={styles.container}>
            <div className={styles.centerCta}>
              <Link href={`${prefix}/#game`} className={styles.heroCta}>
                {page.playCta}
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{t.faq.sectionTitle}</h2>
            <div className={styles.faqList}>
              {page.faqs.map((f, i) => (
                <QuestionFAQ key={i} question={f.q} answer={f.a} />
              ))}
            </div>
          </div>
        </section>


        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
