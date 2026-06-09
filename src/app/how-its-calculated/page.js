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
  return rootMetadata('howItsCalculated', '/how-its-calculated');
}

export default async function HowItsCalculated({ params }) {
  const locale = params?.lang || 'en';
  const t = locale === 'en' ? en : (await getTranslation(locale)) || en;
  const page = t.pages.howItsCalculated || en.pages.howItsCalculated;
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const related = [
    { href: `${prefix}/how-to-play`, label: (t.pages.howToPlay || en.pages.howToPlay).h1 },
    { href: `${prefix}/can-you-go-82-0`, label: (t.pages.canYouGo || en.pages.canYouGo).h1 },
    { href: `${prefix}/team-builder`, label: (t.pages.teamBuilder || en.pages.teamBuilder).h1 },
  ];

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
        <RelatedLinks title={t.footer?.related || 'Related guides'} links={related} />
        <SquadCta t={t} />
      </main>
      <Footer t={t} lang={locale} />
    </>
  );
}
