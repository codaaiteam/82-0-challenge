/** @type {import('next-sitemap').IConfig} */
const languages = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt'];
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.82-0-challenge.com';

const contentPages = [
  '/82-0',
  '/how-to-play',
  '/unblocked',
  '/how-its-calculated',
  '/can-you-go-82-0',
  '/games-like-82-0',
  '/team-builder',
  '/20-0',
  '/38-0',
  '/daily',
];

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
