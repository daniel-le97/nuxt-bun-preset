// https://nuxt.com/docs/api/configuration/nuxt-config
const dev = process.env.NODE_ENV !== 'production'
export default defineNuxtConfig({
  extends: ['./auth'],
  devtools: { enabled: true },

  // modules: ['@hebilicious/authjs-nuxt']
  nitro: {
    entry: dev ? './preset/entry.dev.ts' : undefined,
    preset: './server/preset',
    typescript: {
      tsConfig: {
        exclude: ['../eslint.config.js'],
        include: ['../auth/server'],
      },
    },
  },

  modules: ['@nuxt/ui', '@vueuse/nuxt'],
})
