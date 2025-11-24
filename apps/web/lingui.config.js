module.exports = {
  locales: ['en', 'es', 'pt', 'cl'],
  sourceLocale: 'en',
  fallbackLocales: {
    default: 'en'
  },
  catalogs: [
    {
      path: '<rootDir>/locales/{locale}/messages',
      include: ['<rootDir>/src'],
      exclude: ['**/node_modules/**']
    }
  ],
  format: 'po',
  rootDir: '.',
  compileNamespace: 'cjs'
}
