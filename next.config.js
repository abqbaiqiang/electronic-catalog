/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['source.unsplash.com', 'localhost'],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = require('path').resolve(__dirname, '.')
    return config
  }
}

module.exports = nextConfig
