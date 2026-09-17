/** @type {import('next-sitemap').IConfig} */
const languages = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.82-0-challenge.com';

// Content pages are discovered from src/app/ rather than hand-listed, so a page
// cannot be shipped and then silently left out of the sitemap. Anything with a
// page.js under src/app/<slug>/ counts, minus the app/utility routes below.
const fs = require('fs');
const path = require('path');

const NON_CONTENT = new Set([
  'Components', 'api', '[lang]', 'about', 'privacy', 'terms',
  'leaderboard', 'share',
]);

function discoverContentPages() {
  const appDir = path.join(__dirname, 'src', 'app');
  let found = [];
  try {
    found = fs.readdirSync(appDir, { withFileTypes: true })
      .filter(e => e.isDirectory() && !NON_CONTENT.has(e.name) && !e.name.startsWith('['))
      .filter(e => fs.existsSync(path.join(appDir, e.name, 'page.js')))
      .map(e => `/${e.name}`);
  } catch (err) {
    console.warn('[next-sitemap] could not scan src/app, falling back to the static list:', err.message);
  }
  // Union with the hand-written list so nothing that used to be in the sitemap
  // can drop out if the scan misses something.
  return Array.from(new Set([...found, ...LEGACY_CONTENT_PAGES])).sort();
}

const LEGACY_CONTENT_PAGES = [
  '/82-0',
  '/82-0-cap-mode',
  '/82-0-filter',
  '/82-0-no-mvps',
  '/82-0-one-team',
  '/82-0-one-decade',
  '/82-0-hard-mode',
  '/82-0-era-mode',
  '/82-0-lebron',
  '/82-0-nhl',
  '/how-to-play',
  '/unblocked',
  '/how-its-calculated',
  '/can-you-go-82-0',
  '/games-like-82-0',
  '/82-0-for-other-sports',
  '/team-builder',
  '/17-0',
  '/20-0',
  '/38-0',
  '/7-0',
  '/162-0',
  '/daily',
];

const contentPages = discoverContentPages();

const staticPages = [
  '/privacy',
  '/terms',
  '/about',
];

module.exports = {
  siteUrl: baseUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  // /en/* mirrors canonicalize to the locale-less root pages — keep them out.
  exclude: ['/404', '/api/*', '/en', '/en/*'],
  additionalPaths: async (config) => {
    const paths = [];
    const lastmod = new Date().toISOString();
    // English canonical pages live at locale-less root paths; /en/* mirrors
    // canonicalize to them, so only non-English locales get locale URLs.
    const nonEnglish = languages.filter(l => l !== 'en');

    // Homepages
    paths.push({ loc: '/', priority: 1.0, changefreq: 'daily', lastmod });
    nonEnglish.forEach(lang => {
      paths.push({ loc: `/${lang}`, priority: 1.0, changefreq: 'daily', lastmod });
    });

    // Content pages
    contentPages.forEach(page => {
      paths.push({ loc: page, priority: 0.9, changefreq: 'daily', lastmod });
      nonEnglish.forEach(lang => {
        paths.push({ loc: `/${lang}${page}`, priority: 0.9, changefreq: 'daily', lastmod });
      });
    });

    // Static pages (privacy, terms)
    staticPages.forEach(page => {
      paths.push({ loc: page, priority: 0.4, changefreq: 'monthly', lastmod });
    });

    return paths;
  },
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  }
};
