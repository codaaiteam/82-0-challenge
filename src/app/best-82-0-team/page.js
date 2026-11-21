import Link from 'next/link';
import styles from '../page.module.css';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import QuestionFAQ from '../Components/QuestionFAQ';
import SeoSections from '../Components/SeoSections';
import RelatedLinks from '../Components/RelatedLinks';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata('bestTeam', '/best-82-0-team');
}

export default async function BestTeam({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const page = t.pages?.bestTeam || en.pages.bestTeam;
  const prefix = locale === 'en' ? '' : `/${locale}`;

  const related = [
    { href: `${prefix}/how-to-beat-82-0`, label: (t.pages?.howToBeat || en.pages.howToBeat).h1 },
    { href: `${prefix}/how-its-calculated`, label: (t.pages?.howItsCalculated || en.pages.howItsCalculated).h1 },
    { href: `${prefix}/82-0-hard-mode`, label: (t.pages?.hardMode || en.pages.hardMode).h1 },
    { href: `${prefix}/#game`, label: `🏀 ${page.playCta || 'Play the 82-0 Challenge'}` },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (page.faqs || []).map(f => ({
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

        <SeoSections sections={page.sections} />

        <section className={styles.howtoSection}>
          <div className={styles.container}>
            <div className={styles.centerCta}>
              <Link href={`${prefix}/#game`} className={styles.heroCta}>
                🏀 Play the 82-0 Challenge
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{t.faq.sectionTitle}</h2>
            <div className={styles.faqList}>
              {(page.faqs || []).map((f, i) => (
                <QuestionFAQ key={i} question={f.q} answer={f.a} />
              ))}
            </div>
          </div>
        </section>

        <RelatedLinks title={t.footer?.related || 'Related guides'} links={related} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
