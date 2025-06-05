import { NextConfig } from 'next';
const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'assets.adidas.com',
      'static.vecteezy.com',
      'upload.wikimedia.org',
      'dothethao.net.vn'
    ],
  },
};

module.exports = withNextIntl(nextConfig);