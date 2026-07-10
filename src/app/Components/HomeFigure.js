import styles from '../page.module.css';

// Screenshot figure used between the home-page SEO sections. Width/height
// keep layout stable before the lazy image loads.
export default function HomeFigure({ src, alt, caption, width, height }) {
  return (
    <figure className={styles.seoFigure}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className={styles.seoFigureImg}
      />
      {caption && <figcaption className={styles.seoFigureCap}>{caption}</figcaption>}
    </figure>
  );
}
