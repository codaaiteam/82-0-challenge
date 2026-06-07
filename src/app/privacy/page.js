import Link from 'next/link';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import styles from '../legal.module.css';

export const metadata = {
  title: 'Privacy Policy – 82-0 Challenge',
  description: 'Privacy Policy for the 82-0 Challenge team builder game website: cookies, advertising partners, analytics, and your data rights.',
};

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className={styles.legalPage}>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: June 7, 2026</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to 82-0 Challenge (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). This Privacy Policy explains
          what information is collected when you use our website at 82-0-challenge.com (the &quot;Site&quot;),
          how it is used, and the choices you have. By using the Site you agree to this policy.
        </p>

        <h2>2. Information We Collect</h2>
        <ul>
          <li><strong>Game data:</strong> Your lineup picks and results are processed in your browser. The Daily Challenge stores your daily result in your browser&apos;s localStorage only. We do not store game data on our servers and we do not require accounts.</li>
          <li><strong>Analytics:</strong> We use a privacy-friendly, cookie-free analytics tool (Plausible-compatible) that collects aggregated, anonymized usage data such as page views, referrer, and approximate country. No personal identifiers are stored.</li>
          <li><strong>Log data:</strong> Our hosting provider may temporarily process standard server logs (IP address, browser type, timestamps) for security and operations.</li>
        </ul>

        <h2>3. Advertising</h2>
        <p>The Site is supported by advertising. We work with the following advertising partners:</p>
        <ul>
          <li>
            <strong>Google AdSense:</strong> Google and its partners use advertising cookies (including the
            DoubleClick DART cookie) to serve ads based on your visits to this and other websites.
            Google may collect and use data as described in the{' '}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">Google Partner Sites policy</a>.
            You can opt out of personalized advertising by visiting{' '}
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
          </li>
          <li>
            <strong>Adsterra:</strong> Some ad placements are served by Adsterra, which may use cookies
            or similar technologies to measure ad delivery and performance. See the{' '}
            <a href="https://adsterra.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Adsterra Privacy Policy</a>.
          </li>
        </ul>
        <p>
          Third-party vendors and ad networks may serve ads on the Site. You can opt out of many
          third-party advertising cookies at{' '}
          <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer">aboutads.info/choices</a> (US),{' '}
          <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer">youronlinechoices.eu</a> (EU), or via your browser settings.
        </p>

        <h2>4. Cookies</h2>
        <p>
          The Site itself sets no tracking cookies. We use localStorage for game functionality
          (e.g. your Daily Challenge result and your cookie-notice choice). Third-party advertising
          partners listed above may set cookies on your device when ads are displayed. You can block
          or delete cookies at any time through your browser settings; the games remain fully playable
          without cookies.
        </p>

        <h2>5. Legal Bases &amp; Consent (EEA/UK)</h2>
        <p>
          Where required by law (e.g. in the EEA and UK), personalized advertising is only served
          based on your consent, which you can give or decline via the consent notice and revisit
          through the links in Section 3. Non-personalized ads may be shown otherwise.
        </p>

        <h2>6. Your Data Protection Rights (GDPR / CCPA)</h2>
        <ul>
          <li><strong>Access / portability:</strong> you may request a copy of personal data we hold (we hold effectively none beyond transient logs).</li>
          <li><strong>Rectification / erasure:</strong> you may request correction or deletion.</li>
          <li><strong>Objection / restriction:</strong> you may object to or restrict processing.</li>
          <li><strong>CCPA:</strong> California residents may request disclosure or deletion of personal information and may opt out of the &quot;sale&quot; or &quot;sharing&quot; of personal information via the ad-cookie opt-out links in Section 3. We do not sell personal information ourselves.</li>
        </ul>
        <p>To exercise any right, contact us at the address below.</p>

        <h2>7. Children&apos;s Privacy</h2>
        <p>
          The Site is not directed at children under 13 (or the applicable age in your country).
          We do not knowingly collect personal information from children. If you believe a child has
          provided personal data, contact us and we will remove it.
        </p>

        <h2>8. Data Retention &amp; Security</h2>
        <p>
          We maintain no user accounts or personal-data databases. localStorage data stays on your
          device until you clear it. Transient server logs are retained by our hosting provider only
          as long as operationally necessary.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page
          with an updated &quot;Last updated&quot; date.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions or data requests:{' '}
          <a href="mailto:contact@82-0-challenge.com">contact@82-0-challenge.com</a>.
          More about the Site on our <Link href="/about">About page</Link>.
        </p>

        <Link href="/" className={styles.backLink}>&larr; Back to Home</Link>
      </div>
      <Footer />
    </>
  );
}
