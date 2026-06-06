import Link from 'next/link';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Privacy Policy – 82-0 Challenge',
  description: 'Privacy Policy for the 82-0 Challenge team builder game website.',
};

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className={styles.legalPage}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: June 6, 2026</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to 82-0 Challenge ("we", "us", "our"). This Privacy Policy explains
          how we handle information when you use our website at 82-0-challenge.com (the "Site").
        </p>

        <h2>2. Information We Collect</h2>
        <p>We collect minimal information to provide and improve the game experience:</p>
        <ul>
          <li><strong>Game Data:</strong> Your lineup picks and results exist only in your browser session. We do not store game data on our servers.</li>
          <li><strong>Usage Analytics:</strong> We may use privacy-friendly analytics to collect anonymized usage data such as page views and approximate geographic region. No personal identifiers are tracked.</li>
        </ul>

        <h2>3. Third-Party Services</h2>
        <p>We may use the following third-party services:</p>
        <ul>
          <li><strong>Google AdSense / ad networks:</strong> Display advertisements. Ad providers may use cookies to serve personalized ads. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.</li>
          <li><strong>Analytics:</strong> Anonymized, cookie-free website analytics.</li>
        </ul>

        <h2>4. Cookies</h2>
        <p>
          Our Site itself does not set cookies. However, third-party ad services
          may set cookies on your device. You can manage cookie preferences through your browser settings.
        </p>

        <h2>5. Data Storage &amp; Security</h2>
        <p>
          We do not maintain user accounts or databases of personal information.
          All gameplay happens in your browser.
        </p>

        <h2>6. Children&apos;s Privacy</h2>
        <p>
          Our Site is not directed at children under 13. We do not knowingly collect personal
          information from children.
        </p>

        <h2>7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page
          with an updated &quot;Last updated&quot; date.
        </p>

        <h2>8. Contact</h2>
        <p>
          If you have questions about this Privacy Policy, contact us at
          {' '}<a href="mailto:contact@82-0-challenge.com">contact@82-0-challenge.com</a>.
        </p>

        <Link href="/" className={styles.backLink}>&larr; Back to Home</Link>
      </div>
      <Footer />
    </>
  );
}
