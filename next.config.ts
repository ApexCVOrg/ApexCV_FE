import { NextConfig } from 'next';
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'assets.adidas.com',
      'brand.assets.adidas.com',
      'static.vecteezy.com',
      'upload.wikimedia.org',
      'dothethao.net.vn',
      'res.cloudinary.com',
      'nidas-fe.vercel.app',
      'nidas-70lhai0y8-nidas-projects-e8bff2a3.vercel.app',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/payment/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com'}/payment/:path*`,
      },
    ];
  },
};
module.exports = withNextIntl(nextConfig);
