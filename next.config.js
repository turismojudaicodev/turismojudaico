const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'default',
    domains: ['localhost', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/paises/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/paises',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ciudades/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/ciudades',
        destination: '/',
        permanent: true,
      },
      {
        source: '/contenidos/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/contenidos',
        destination: '/',
        permanent: true,
      },
      {
        source: '/contenido/:slug*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/contenido',
        destination: '/',
        permanent: true,
      },
      {
        source: '/tour/:slug*',
        destination: '/tours',
        permanent: true,
      },
      {
        source: '/test/:slug*',
        destination: '/',
        permanent: true,
      },
    ]
  },
  swcMinify: false,
  i18n,
}

module.exports = nextConfig
