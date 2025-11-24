const crypto = require('crypto');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '',
  assetPrefix: '',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    unoptimized: true,
  },
  // Generate build hash for versioned caching
  generateBuildId: async () => {
    return crypto.randomBytes(6).toString('hex');
  },
  serverExternalPackages: [],
  // Exclude service worker from static generation
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;
