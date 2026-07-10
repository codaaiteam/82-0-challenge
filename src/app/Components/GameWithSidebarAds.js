// Adsterra sidebar/banner slots removed 2026-07 for the AdSense re-review —
// third-party ad units (especially the past deceptive "security alert"
// creatives) read as a policy violation during review, which runs site-wide.
// Restore from git history (AdsterraSidebar / AdsterraBanner300x250) only
// after AdSense approval, if at all.
export default function GameWithSidebarAds({ children }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '1180px',
      margin: '0 auto',
      padding: '0 1rem',
    }}>
      <div style={{ flex: '1 1 auto', maxWidth: '760px', width: '100%' }}>
        {children}
      </div>
    </div>
  );
}
