/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://bid.nyelizabeth.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: [
    '/Admin/*',
    '/my-account/*',
    '/my-information/*',
    '/seller-portal/*',
    '/checkout/*',
    '/checkout-intent',
    '/payment-success',
    '/success',
    '/verify-email',
    '/forget-password',
    '/reset-password/*',
    '/members/*',
  ],
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/Admin/*',
          '/my-account/*',
          '/my-information/*',
          '/seller-portal/*',
          '/checkout/*',
          '/checkout-intent',
          '/payment-success',
          '/success',
          '/verify-email',
          '/forget-password',
          '/reset-password/*',
          '/members/*',
        ],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    ],
  },
} 