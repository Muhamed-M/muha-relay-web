// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Muha Relay',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'manifest', href: '/manifest.webmanifest?v=2' },
        { rel: 'apple-touch-icon', href: '/favicon.svg' },
      ],
      meta: [
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content',
        },
        { name: 'theme-color', content: '#000000' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Muha Relay' },
      ],
    },
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  colorMode: {
    preference: 'light',
  },
  runtimeConfig: {
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    vapidSubject: process.env.VAPID_SUBJECT || 'mailto:muhamedmuhamedagic03@gmail.com',
    public: {
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    },
  },
});
