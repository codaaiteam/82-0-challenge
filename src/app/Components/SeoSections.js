import styles from '../page.module.css';

// Renders an array of { h2, paragraphs[] } locale sections as SEO content.
export default function SeoSections({ sections }) {
  if (!sections?.length) return null;
  return (
    <section className={styles.seoSection}>
      <div className={styles.container}>
        {sections.map((s, i) => (
          <div key={i} className={styles.seoBlock}>
            <h2 className={styles.sectionTitle}>{s.h2}</h2>
            {s.paragraphs.map((p, j) => (
              <p key={j} className={styles.seoParagraph}>{p}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
