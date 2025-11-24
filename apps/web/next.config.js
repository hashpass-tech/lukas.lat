const crypto = require('crypto');
const path = require('path');
const { default: withSerwist } = require('@serwist/next');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '',
  assetPrefix: '',
  images: {
    unoptimized: true,
  },
  // Generate build hash for versioned caching
  generateBuildId: async () => {
    return crypto.randomBytes(6).toString('hex');
  },
  serverExternalPackages: [],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
}

// Serwist configuration for PWA
const withSerwistConfig = withSerwist({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withSerwistConfig(nextConfig);
