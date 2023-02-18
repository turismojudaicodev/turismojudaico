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
        domain: 'turismojudaico.vercel.app.en',
        defaultLocale: 'en',
      },
    ],
  },
  react: { useSuspense: false },
}
