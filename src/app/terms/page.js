import Link from 'next/link';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Terms of Use – 82-0 Challenge',
  description: 'Terms of Use for the 82-0 Challenge team builder game website.',
};

export default function TermsOfUse() {
  return (
    <>
      <Header />
      <div className={styles.legalPage}>
        <h1>Terms of Use</h1>
        <p className={styles.lastUpdated}>Last updated: June 6, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using 82-0 Challenge (&quot;the Site&quot;) at 82-0-challenge.com,
          you agree to be bound by these Terms of Use. If you do not agree, please do not use the Site.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          The Site provides a free browser-based fantasy team builder game. Players draft a
          five-player lineup of historical basketball players and receive a simulated season
          record based on aggregate statistics. The game is for entertainment purposes only.
        </p>

        <h2>3. Not Affiliated with the NBA</h2>
        <p>
          82-0 Challenge is an independent fan-made project. It is not affiliated with, endorsed
          by, or sponsored by the NBA or any professional basketball league or team. Player names
          and historical statistics are publicly available facts used for informational and
          entertainment purposes only. No official logos, trademarks, or photographs are used.
          Simulated records are randomly generated for fun and have no predictive value.
        </p>

        <h2>4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Attempt to disrupt, overload, or attack the Site.</li>
          <li>Scrape or republish the Site&apos;s content at scale without permission.</li>
          <li>Use the Site for any unlawful purpose.</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>
          The Site&apos;s original design, code, and content are owned by us.
          You may share your game results freely.
        </p>

        <h2>6. Disclaimer of Warranties</h2>
        <p>
          The Site is provided &quot;as is&quot; without warranties of any kind. Simulated records
          are randomly generated for fun and have no predictive or statistical value.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, we shall not be liable for any indirect,
          incidental, or consequential damages arising from your use of the Site.
        </p>

        <h2>8. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the Site after changes
          constitutes acceptance of the new Terms.
        </p>

        <h2>9. Contact</h2>
        <p>
          Questions? Contact us at
          {' '}<a href="mailto:contact@82-0-challenge.com">contact@82-0-challenge.com</a>.
        </p>

        <Link href="/" className={styles.backLink}>&larr; Back to Home</Link>
      </div>
      <Footer />
    </>
  );
}
