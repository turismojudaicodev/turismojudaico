module.exports = {
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    domains: [
      {
        domain: 'turismojudaico.vercel.app',
        defaultLocale: 'es',
      },
      {
        domain: 'en.turismojudaico.vercel.app',
        defaultLocale: 'en',
      },
    ],
    localeDetection: false,
  },
  react: { useSuspense: false },
}
