import Link from 'next/link';
import styles from '../page.module.css';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import SeoSections from '../Components/SeoSections';
import RelatedLinks from '../Components/RelatedLinks';
import SquadCta from '../Components/SquadCta';
import en from '@/locales/en.json';
import { getTranslation } from '@/lib/i18n';
import { rootMetadata } from '@/lib/pageMeta';

export async function generateMetadata() {
  return rootMetadata('howToPlay', '/how-to-play');
}

export default async function HowToPlay({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const page = t.pages.howToPlay;
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

        <section className={styles.howtoSection}>
          <div className={styles.container}>
            <div className={styles.stepsGrid}>
              {page.steps.map((step, i) => (
                <div key={i} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{i + 1}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
            <div className={styles.centerCta}>
              <Link href={`${prefix}/#game`} className={styles.heroCta}>
                {t.hero.cta}
              </Link>
            </div>
          </div>
        </section>

        <SeoSections sections={page.sections} />
        <RelatedLinks
          title={t.footer?.related || 'Related guides'}
          links={[
            { href: `${prefix}/how-its-calculated`, label: (t.pages.howItsCalculated || en.pages.howItsCalculated).h1 },
            { href: `${prefix}/can-you-go-82-0`, label: (t.pages.canYouGo || en.pages.canYouGo).h1 },
          ]}
        />
        <SquadCta t={t} />
      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
