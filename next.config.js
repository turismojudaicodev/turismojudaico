const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'default',
    domains: ['localhost'],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:1337/admin'
            : process.env.ADMIN_PANEL_URL,
        permanent: true,
      },
    ]
  },
  i18n,
}

module.exports = nextConfig
