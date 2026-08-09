const products = [
  {
    name: 'VO3 AI',
    url: 'https://www.vo3ai.com/tools/football-career-video?utm_source=game_site&utm_medium=internal_ad&utm_campaign=game_network',
    image: '/internal-ads/vo3ai-card.svg',
    alt: 'VO3 AI - AI football career video generator',
    kicker: 'AI sports video',
    title: 'Create a football career video',
    copy: 'Make sports highlight-style AI videos.',
    cta: 'Make video',
    accent: '#a78bfa',
  },
  {
    name: 'C2Story',
    url: 'https://www.c2story.com/?utm_source=game_site&utm_medium=internal_ad&utm_campaign=game_network',
    image: '/internal-ads/c2story-sports-card.jpg',
    alt: 'C2Story - AI sports comic maker',
    kicker: 'AI sports comics',
    title: 'Create your own sports comic',
    copy: 'Turn match ideas into illustrated comics.',
    cta: 'Start free',
    accent: '#5eead4',
  },
]

const sectionStyle = {
  width: '100%',
  padding: '8px 16px 30px',
}

const shellStyle = {
  maxWidth: '1040px',
  margin: '0 auto',
  padding: '14px',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '24px',
  background: 'linear-gradient(135deg, rgba(15,23,42,0.78), rgba(2,6,23,0.58))',
  boxShadow: '0 18px 50px rgba(0,0,0,0.18)',
}

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  margin: '0 0 12px',
  color: 'rgba(255,255,255,0.58)',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '12px',
}

const cardStyle = {
  display: 'grid',
  gridTemplateColumns: '112px 1fr',
  alignItems: 'center',
  gap: '14px',
  minHeight: '102px',
  padding: '10px',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.045)',
  color: '#fff',
  textDecoration: 'none',
}

export default function InternalProductAds() {
  return (
    <aside style={sectionStyle} aria-label="Sponsored recommendations">
      <div style={shellStyle}>
        <div style={headerStyle}>
          <span>Sponsored tools</span>
          <span style={{ letterSpacing: 0, textTransform: 'none', fontWeight: 700 }}>From our network</span>
        </div>
        <div style={gridStyle}>
          {products.map((product) => (
            <a
              key={product.name}
              style={cardStyle}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              data-internal-product-ad={product.name}
            >
              <img
                src={product.image}
                alt={product.alt}
                loading="lazy"
                style={{ width: '112px', height: '72px', borderRadius: '14px', objectFit: 'cover', display: 'block' }}
              />
              <span style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                <span style={{ color: product.accent, fontSize: '11px', fontWeight: 850, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{product.kicker}</span>
                <strong style={{ color: '#fff', fontSize: '17px', lineHeight: 1.15, fontWeight: 850 }}>{product.title}</strong>
                <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: '13px', lineHeight: 1.3 }}>{product.copy}</span>
                <em style={{ color: 'rgba(255,255,255,0.86)', fontSize: '13px', fontStyle: 'normal', fontWeight: 800 }}>{product.cta} →</em>
              </span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
