import Link from 'next/link';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import styles from '../legal.module.css';

export const metadata = {
  title: 'About – 82-0 Challenge',
  description: 'About 82-0 Challenge: who we are, why we built the viral perfect-season team builder games, and how to contact us.',
};

export default function About() {
  return (
    <>
      <Header />
      <div className={styles.legalPage}>
        <h1>About 82-0 Challenge</h1>
        <p className={styles.lastUpdated}>The home of perfect-season team builder games</p>

        <h2>What is this site?</h2>
        <p>
          82-0 Challenge is a free browser arcade built around one question: can you draft a team
          so good it never loses? We host three games in the viral perfect-season family — the{' '}
          <Link href="/">82-0 basketball challenge</Link> (five legends, 82 games), the{' '}
          <Link href="/20-0">20-0 NFL challenge</Link> (a 9-man roster, 20 games to a perfect Super
          Bowl run), and the <Link href="/38-0">38-0 Premier League challenge</Link> (a full starting
          XI chasing what even the Invincibles never did). Plus a <Link href="/daily">Daily
          Challenge</Link> where everyone in the world gets the same spins, once per day.
        </p>

        <h2>How the games work</h2>
        <p>
          Every game runs on the same idea: a slot machine assigns you a random team and era, you
          draft real players with their historical statistics, and a simulation engine — era-adjusted
          stats, non-linear win curves, positional gates — projects whether your roster could go
          undefeated. No downloads, no accounts, free to play, available in seven languages
          (English, 中文, 日本語, 한국어, Español, Français, Deutsch).
        </p>

        <h2>Who makes it</h2>
        <p>
          82-0 Challenge is an independent project built and maintained by a small indie team. It is
          not affiliated with, endorsed by, or sponsored by the NBA, the NFL, the Premier League, or
          any club, league, or players&apos; association. Player names and historical statistics are
          publicly available facts used for informational and entertainment purposes only. No
          official logos, trademarks, or photographs are used.
        </p>

        <h2>How the site is funded</h2>
        <p>
          The Site is free and supported by advertising (see our{' '}
          <Link href="/privacy">Privacy Policy</Link> for details on our advertising partners and
          your choices).
        </p>

        <h2 id="contact">Contact</h2>
        <p>
          Feedback, corrections to player data, partnership or press inquiries:{' '}
          <a href="mailto:contact@82-0-challenge.com">contact@82-0-challenge.com</a>.
          We read everything.
        </p>

        <Link href="/" className={styles.backLink}>&larr; Back to Home</Link>
      </div>
      <Footer />
    </>
  );
}
