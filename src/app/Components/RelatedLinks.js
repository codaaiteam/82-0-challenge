import Link from 'next/link';
import styles from '../page.module.css';

// Contextual internal-link block. links: [{ href, label }]
export default function RelatedLinks({ title, links }) {
  if (!links?.length) return null;
  return (
    <section className={styles.seoSection}>
      <div className={styles.container}>
        <div className={styles.seoBlock}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p className={styles.seoParagraph}>
            {links.map((l, i) => (
              <span key={i}>
                {i > 0 && ' · '}
                <Link href={l.href}>{l.label}</Link>
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
