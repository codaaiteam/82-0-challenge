import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '../../Components/Header';
import Footer from '../../Components/Footer';
import en from '@/locales/en.json';
import styles from './share.module.css';

const LB_API = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8788'
  : 'https://lb.82-0-challenge.com';

// Shares are immutable, so cache fetches indefinitely.
async function getShare(id) {
  if (!/^[a-f0-9]{20}$/.test(id)) return null;
  try {
    const res = await fetch(`${LB_API}/share?id=${id}`, { next: { revalidate: 31536000 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const data = await getShare(params.id);
  if (!data) return { title: '82-0 Challenge' };
  const record = `${data.wins}–${data.losses}`;
  return {
    title: `${record} in the 82-0 Challenge — can you beat it?`,
    description: `Someone built a starting five that went ${record} (grade ${data.grade}). Build your own all-time team and try to go 82-0.`,
    // Viral landing pages, not search content — keep them out of the index.
    robots: { index: false, follow: true },
    openGraph: {
      title: `${record} in the 82-0 Challenge`,
      description: `Grade ${data.grade} · ${data.points} pts team rating. Think you can beat it?`,
    },
  };
}

const CHIP_COLORS = ['chipC0', 'chipC1', 'chipC2', 'chipC3', 'chipC4'];

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default async function SharePage({ params }) {
  const data = await getShare(params.id);
  if (!data) notFound();

  const g = en.game;
  const sp = en.sharePage || {};
  const record = `${data.wins}–${data.losses}`;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.kicker}>{sp.kicker || 'Shared result'}</div>
          <div className={styles.record}>{record}</div>
          <div className={styles.gradeRow}>
            <span className={styles.grade}>{data.grade}</span>
            <span className={styles.pts}>· {data.points} {g.pts || 'pts'}</span>
          </div>

          <div className={styles.lineup}>
            {data.lineup.map((p, i) => (
              <div key={i} className={styles.row}>
                <span className={`${styles.chip} ${styles[CHIP_COLORS[i]]}`}>
                  <b>{initials(p.name)}</b>
                  <i>{p.pos}</i>
                </span>
                <span className={styles.name}>
                  {p.name}
                  <small>{p.team} · {p.decade}</small>
                </span>
              </div>
            ))}
          </div>

          <div className={styles.cta}>
            <p>{sp.challenge || 'Think you can build a better five?'}</p>
            <Link href="/#game" className={styles.playBtn}>
              {sp.play || 'Play the 82-0 Challenge →'}
            </Link>
          </div>
        </div>
      </main>
      <Footer t={en} lang="en" />
    </>
  );
}
