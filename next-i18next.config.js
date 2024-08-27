module.exports = {
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    localeDetection: false,
    domains: [
      {
        domain: 'turismojudaico.com',
        defaultLocale: 'en',
      },
      {
        domain: 'es.turismojudaico.com',
        defaultLocale: 'es',
      },
    ],
  },
  react: { useSuspense: false },
}
