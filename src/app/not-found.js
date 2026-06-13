import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Inter, -apple-system, sans-serif',
      background: '#0c0d11',
      color: '#eef1f8',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 900, margin: 0, color: '#f2641e' }}>0-82</h1>
      <p style={{ fontSize: '1.1rem', color: '#8292b0', marginTop: '0.5rem' }}>
        This page could not be found. That&apos;s a winless season.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '1.5rem',
          padding: '0.7rem 2rem',
          background: 'linear-gradient(135deg, #f2641e, #c24e12)',
          color: '#fff',
          borderRadius: '10px',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: 700,
        }}
      >
        Back to the Challenge
      </Link>
    </div>
  );
}
