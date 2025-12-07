// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Muha Relay',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'apple-touch-icon', href: '/favicon.svg' },
      ],
      meta: [
        { name: 'theme-color', content: '#000000' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'CoolApp' },
      ],
    },
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  colorMode: {
    preference: 'light',
  },
});
