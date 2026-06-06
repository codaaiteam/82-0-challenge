import { getTranslation } from './i18n';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.82-0-challenge.com';
export const LOCALES = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de'];

// Per-page metadata pulled from the locale files.
// pageKey: key under t.pages (whatIs | howToPlay | teamBuilder), or null for home.
export async function pageMetadata(lang, pageKey, path = '') {
  const locale = lang || 'en';
  const t = await getTranslation(locale);
  const page = pageKey ? t.pages?.[pageKey] : null;
  const title = page?.title || t.seoTitle;
  const description = page?.description || t.seoDescription;
  const url = `${BASE_URL}/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(LOCALES.map(l => [l, `${BASE_URL}/${l}${path}`])),
    },
    openGraph: { title, description, url, type: 'website', images: [{ url: '/og.png' }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
  };
}

export function staticLangParams() {
  return LOCALES.map(lang => ({ lang }));
}
