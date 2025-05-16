import { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Bỏ swcMinify vì không còn được hỗ trợ trong Next.js 15.3.2
};

export default config;
