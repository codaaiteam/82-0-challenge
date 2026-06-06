import { getTranslation } from '@/lib/i18n'
import { BASE_URL, LOCALES } from '@/lib/pageMeta'

// Locale-level default metadata. Pages under [lang] override title/description/canonical.
export async function generateMetadata({ params }) {
  const locale = params?.lang || 'en'
  const t = await getTranslation(locale)
  // English mirrors the locale-less root pages — canonicalize back to root.
  const currentUrl = locale === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${locale}`

  return {
    metadataBase: new URL(BASE_URL),
    title: t.seoTitle,
    description: t.seoDescription,
    keywords: t.keywords,
    openGraph: {
      title: t.seoTitle,
      description: t.seoDescription,
      type: 'website',
      url: currentUrl,
      locale: locale,
      images: [{ url: '/og.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t.seoTitle,
      description: t.seoDescription,
      images: ['/og.png'],
    },
    alternates: {
      canonical: currentUrl,
      languages: {
        'x-default': `${BASE_URL}/`,
        ...Object.fromEntries(LOCALES.map(l => [l, l === 'en' ? `${BASE_URL}/` : `${BASE_URL}/${l}`])),
      },
    },
    robots: 'index, follow',
  }
}

export default function LangLayout({ children }) {
  return children
}
