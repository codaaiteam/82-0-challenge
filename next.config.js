/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export for Cloudflare Pages (Railway account was banned).
  // The whole site is static; the only dynamic route (/share/<id>) now lives
  // in a Cloudflare Pages Function under functions/share/[id].js.
  output: 'export',
  images: { unoptimized: true },
};

module.exports = nextConfig;
