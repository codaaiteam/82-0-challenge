const sectionStyle = {
  width: '100%',
  padding: '24px 16px 34px',
  background: 'linear-gradient(180deg, rgba(5, 9, 22, 0), rgba(5, 9, 22, 0.58))',
}

const innerStyle = {
  maxWidth: '980px',
  margin: '0 auto',
}

const labelStyle = {
  margin: '0 0 12px',
  color: 'rgba(255, 255, 255, 0.62)',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '14px',
}

const cardStyle = {
  display: 'grid',
  gridTemplateColumns: '132px 1fr',
  alignItems: 'center',
  gap: '14px',
  minHeight: '118px',
  padding: '12px',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '20px',
  background: 'rgba(9, 14, 30, 0.82)',
  boxShadow: '0 18px 42px rgba(0, 0, 0, 0.22)',
  color: '#fff',
  textDecoration: 'none',
  overflow: 'hidden',
}

const imageStyle = {
  width: '132px',
  height: '82px',
  borderRadius: '14px',
  objectFit: 'cover',
  display: 'block',
}

const bodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  minWidth: 0,
}

export default function InternalProductAds() {
  const products = [
    {
      name: 'VO3 AI',
      url: 'https://www.vo3ai.com/?utm_source=game_site&utm_medium=internal_ad&utm_campaign=game_network',
      image: '/internal-ads/vo3ai-card.svg',
      alt: 'VO3 AI - Create AI videos in minutes',
      eyebrow: 'AI Video Tool',
      title: 'Create AI videos in minutes',
      cta: 'Try VO3 AI',
      theme: '#a78bfa',
    },
    {
      name: 'C2Story',
      url: 'https://www.c2story.com/?utm_source=game_site&utm_medium=internal_ad&utm_campaign=game_network',
      image: '/internal-ads/c2story-card.svg',
      alt: 'C2Story - Make personalized storybooks with AI',
      eyebrow: 'AI Storybook Maker',
      title: 'Make personalized storybooks with AI',
      cta: 'Try C2Story',
      theme: '#5eead4',
    },
  ]

  return (
    <section style={sectionStyle} aria-label="Recommended AI tools">
      <div style={innerStyle}>
        <p style={labelStyle}>Recommended AI tools</p>
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
              <img src={product.image} alt={product.alt} loading="lazy" style={imageStyle} />
              <div style={bodyStyle}>
                <span style={{ color: product.theme, fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{product.eyebrow}</span>
                <strong style={{ color: '#fff', fontSize: '18px', lineHeight: 1.15 }}>{product.title}</strong>
                <em style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '13px', fontStyle: 'normal', fontWeight: 700 }}>{product.cta} →</em>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
