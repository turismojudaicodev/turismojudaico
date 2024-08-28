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
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'en.turismojudaico.com',
          },
        ],
        destination: '/en/:path*',
        permanent: true,
      },
      {
        source: '/test/:slug*',
        destination: '/',
        permanent: true,
      },
    ]
  },
  i18n,
}

module.exports = nextConfig
