// Cross-promo bar linking to the X-0 Games hub. Fixed to the very top of the
// viewport (z above the fixed header, which is shifted down by this bar's
// height). Copy is scenario-specific ("Finished <this game>? Try ...") so it
// reads as an in-site recommendation, not a generic nav link. Single-line /
// nowrap with a clamped font keeps height a predictable 36px on every screen
// — the header top and content padding-top are offset to match.
export default function AnnouncementBar() {
  return (
    <a
      href="https://x-0-game.com/"
      target="_blank"
      rel="noopener"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: '36px',
        lineHeight: '36px',
        padding: '0 12px',
        background: 'linear-gradient(90deg, #f97316, #ef4444)',
        color: '#ffffff',
        fontSize: 'clamp(11px, 2.6vw, 13px)',
        fontWeight: 600,
        textAlign: 'center',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        boxSizing: 'border-box',
      }}
    >
      🎮 Finished 82-0? Try 38-0, 7-0, 20-0 and more →
    </a>
  );
}
