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
  build: {
    transpile: ['./server/handlers'],
  },

  devtools: { enabled: true },
  imports: {
    dirs: ['./models'],
  },
  tailwindcss: {
    quiet: true,
    addTwUtil: true,
    config: {
      theme: {
        extend: {
          colors: {
            // Updated color names
            sky: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              // ... other shades
              900: '#001e3c',
            },
            stone: {
              50: '#f4f4f4',
              100: '#e4e4e4',
              // ... other shades
              900: '#1a202c',
            },
            neutral: {
              50: '#f9fafb',
              100: '#f2f4f8',
              // ... other shades
              900: '#1a202c',
            },
            gray: {
              50: '#f9fafb',
              100: '#f2f4f8',
              // ... other shades
              900: '#1a202c',
            },
            slate: {
              50: '#f9fafb',
              100: '#f2f4f8',
              // ... other shades
              900: '#1a202c',
            },
          },
        },
      },
    },

  },
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
      db: { driver: 'fsLite', base: './.data' },
    },
    imports: {
      dirs: ['./models', './server/handlers'],
    },
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    entry: dev ? './core/entry.dev.ts' : undefined,
    preset: './server/core',
    typescript: {
      tsConfig: {
        exclude: ['../eslint.config.js'],
        include: ['../auth/server'],
      },
    },
  },

  modules: ['@nuxt/ui', '@vueuse/nuxt'],
})
