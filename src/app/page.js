import styles from './page.module.css';
import Header from './Components/Header';
import Footer from './Components/Footer';
import QuestionFAQ from './Components/QuestionFAQ';
import GameMain from './Components/Game/GameMain';
import GameWithSidebarAds from './Components/GameWithSidebarAds';
import SeoSections from './Components/SeoSections';
import RelatedLinks from './Components/RelatedLinks';
import MoreModes from './Components/MoreModes';
import HomeFigure from './Components/HomeFigure';
import WinCurveChart from './Components/WinCurveChart';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata(null, '');
}

export default async function Home({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [1, 2, 3, 4, 5, 6].map(i => ({
      '@type': 'Question',
      name: t.faq[`q${i}`],
      acceptedAnswer: { '@type': 'Answer', text: t.faq[`a${i}`] },
    })),
  };

  return (
    <>
      <Header />
      <main className={styles.mainContent}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.heroKicker}>{t.header?.siteName || '82-0 Basketball Builder'}</span>
            <h1 className={styles.heroTitle}>{t.hero.title}</h1>
            <p className={styles.heroSubtitle}>{t.hero.subtitle}</p>
            <a href="#game" className={styles.heroCta}>{t.hero.cta}</a>
          </div>
        </section>

        {/* Game */}
        <section id="game" className={styles.gameSection}>
          <GameWithSidebarAds>
            <GameMain t={t} />
          </GameWithSidebarAds>
        </section>

        {/* Entry point to the newer 82-0 modes */}
        <MoreModes t={t} prefix={prefix} />

        {/* SEO content, interleaved with own-product screenshots and an
            original chart — visual anchors between the text sections. */}
        <SeoSections sections={t.homeSeo.sections.slice(0, 1)} />
        <HomeFigure
          src="/images/game-draft.webp"
          alt={t.homeFigures?.draftAlt || en.homeFigures.draftAlt}
          caption={t.homeFigures?.draftCaption || en.homeFigures.draftCaption}
          width={800} height={694}
        />
        <SeoSections sections={t.homeSeo.sections.slice(1, 2)} />
        <HomeFigure
          src="/images/game-result.webp"
          alt={t.homeFigures?.resultAlt || en.homeFigures.resultAlt}
          caption={t.homeFigures?.resultCaption || en.homeFigures.resultCaption}
          width={800} height={775}
        />
        <SeoSections sections={t.homeSeo.sections.slice(2, 3)} />
        <WinCurveChart t={t.homeFigures ? t : en} />
        <SeoSections sections={t.homeSeo.sections.slice(3, 5)} />
        <HomeFigure
          src="/images/game-setup.webp"
          alt={t.homeFigures?.setupAlt || en.homeFigures.setupAlt}
          caption={t.homeFigures?.setupCaption || en.homeFigures.setupCaption}
          width={800} height={742}
        />
        <SeoSections sections={t.homeSeo.sections.slice(5)} />

        {/* Contextual internal links */}
        <RelatedLinks
          title={t.footer?.related || 'Related guides'}
          links={[
            { href: `${prefix}/how-its-calculated`, label: (t.pages.howItsCalculated || en.pages.howItsCalculated).h1 },
            { href: `${prefix}/can-you-go-82-0`, label: (t.pages.canYouGo || en.pages.canYouGo).h1 },
            { href: `${prefix}/games-like-82-0`, label: (t.pages.gamesLike || en.pages.gamesLike).h1 },
          ]}
        />

        {/* FAQ */}
        <section id="faq" className={styles.faqSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{t.faq.sectionTitle}</h2>
            <div className={styles.faqList}>
              <QuestionFAQ question={t.faq.q1} answer={t.faq.a1} />
              <QuestionFAQ question={t.faq.q2} answer={t.faq.a2} />
              <QuestionFAQ question={t.faq.q3} answer={t.faq.a3} />
              <QuestionFAQ question={t.faq.q4} answer={t.faq.a4} />
              <QuestionFAQ question={t.faq.q5} answer={t.faq.a5} />
              <QuestionFAQ question={t.faq.q6} answer={t.faq.a6} />
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
