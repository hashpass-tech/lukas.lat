/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/lukas.lat' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/lukas.lat' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
