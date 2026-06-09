import { getTranslation } from './i18n';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.82-0-challenge.com';
export const LOCALES = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];

// English lives at the locale-less root URLs — they are the canonical pages.
// /en/* mirrors them and canonicalizes back to the root version.
function rootUrl(path) {
  return `${BASE_URL}${path || '/'}`;
}

function langUrl(lang, path) {
  return lang === 'en' ? rootUrl(path) : `${BASE_URL}/${lang}${path}`;
}

function hreflangs(path) {
  return {
    'x-default': rootUrl(path),
    ...Object.fromEntries(LOCALES.map(l => [l, langUrl(l, path)])),
  };
}

function buildMeta(title, description, canonical, path) {
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: hreflangs(path),
    },
    openGraph: { title, description, url: canonical, type: 'website', images: [{ url: '/og.png' }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
  };
}

// Metadata for /[lang]/... pages. English pages canonicalize to the root URL.
export async function pageMetadata(lang, pageKey, path = '') {
  const locale = lang || 'en';
  const t = await getTranslation(locale);
  const page = pageKey ? t.pages?.[pageKey] : null;
  const title = page?.title || t.seoTitle;
  const description = page?.description || t.seoDescription;
  return buildMeta(title, description, langUrl(locale, path), path);
}

// Metadata for the locale-less root pages (always English, canonical to self).
export async function rootMetadata(pageKey, path = '') {
  const t = await getTranslation('en');
  const page = pageKey ? t.pages?.[pageKey] : null;
  const title = page?.title || t.seoTitle;
  const description = page?.description || t.seoDescription;
  return buildMeta(title, description, rootUrl(path), path);
}

export function staticLangParams() {
  return LOCALES.map(lang => ({ lang }));
}
