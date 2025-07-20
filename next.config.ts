import { NextConfig } from 'next';
const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'assets.adidas.com',
      'brand.assets.adidas.com',
      'static.vecteezy.com',
      'upload.wikimedia.org',
      'dothethao.net.vn'
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/payment/:path*',
        destination: 'http://localhost:5000/api/payment/:path*',
      },
    ];
  },
};
module.exports = withNextIntl(nextConfig);
