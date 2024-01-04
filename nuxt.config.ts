// https://nuxt.com/docs/api/configuration/nuxt-config
const dev = process.env.NODE_ENV !== 'production'
if (!process.env.NUXT_AUTH_PASSWORD) {
  console.warn('Security warning: NUXT_AUTH_PASSWORD is not set. Using an example value. Please set it otherwise your session is unsecure!')
  process.env.NUXT_AUTH_PASSWORD = 'secretsecretsecretsecretsecretsecretsecret'
}
export default defineNuxtConfig({
  experimental: {
    componentIslands: true,
    
  },
  devtools: { enabled: true },
  imports:{
    dirs: ['./models']
  },
  


  // modules: ['@hebilicious/authjs-nuxt']
  nitro: {
  experimental: {
    openAPI: true,
  },
    runtimeConfig: {
      auth: {
        name: 'nuxt-session',
        password: process.env.NUXT_AUTH_PASSWORD || '',
        
      },

    },
    storage: {
      db: { driver: 'fs', base: './.data' },
    },
    imports:{
      dirs: ['./models']
    },
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
