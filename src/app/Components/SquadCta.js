import styles from '../page.module.css';

// Cross-promo block — funnels players to the C2Story AI Character Squad Builder.
export default function SquadCta({ t }) {
  return (
    <section className={styles.squadCta}>
      <div className={styles.squadCtaInner}>
        <h2 className={styles.squadCtaTitle}>{t.cta.title}</h2>
        <p className={styles.squadCtaDesc}>{t.cta.desc}</p>
        <a
          href="https://c2story.com/dream-team-storybook?game=82-0&utm_source=82-0-challenge&utm_medium=squad_cta"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.squadCtaButton}
        >
          {t.cta.button}
        </a>
      </div>
    </section>
  );
}
