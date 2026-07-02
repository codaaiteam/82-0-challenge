import styles from '../page.module.css';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import QuestionFAQ from '../Components/QuestionFAQ';
import WorldCupGame from '../Components/Game/WorldCupGame';
import SeoSections from '../Components/SeoSections';
import SquadCta from '../Components/SquadCta';
import AdsterraNativeBanner from '../Components/AdsterraNativeBanner';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata('sevenZero', '/7-0');
}

export default async function SevenZero({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const page = t.pages.sevenZero || en.pages.sevenZero;

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

        {/* Playable World Cup dream-team builder — full width to keep the 3-column board */}
        <section id="game" className={styles.gameSection}>
          <WorldCupGame t={t} />
        </section>
        {/* Adsterra Native Banner — re-enabled at owner request 2026-07;
            pull it again if deceptive "security alert" creatives resurface. */}
        <AdsterraNativeBanner />

        <SeoSections sections={page.sections} />

        {/* Cross-link to the standalone 7-0 site (dofollow) */}
        <section className={styles.howtoSection}>
          <div className={styles.container}>
            <div className={styles.centerCta}>
              <a href="https://7-0-game.com" className={styles.heroCta} target="_blank" rel="noopener">
                {page.playCta}
              </a>
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

        <SquadCta t={t} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
