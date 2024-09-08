// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Muha Relay',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  colorMode: {
    preference: 'light',
  },
  runtimeConfig: {
    apiUrl: process.env.API_URL || 'http://localhost:4000/api',
    socketServerUrl: process.env.SOCKET_SERVER_URL || 'ws://localhost:8080',
  },
});
