import type { Server } from 'bun'

export default defineNitroPlugin(async (nitroApp) => {
  // @ts-expect-error it is assigned in preset/entry.dev.ts
  nitroApp.hooks.hook('server', (server: Server) => {
    // console.log('server', server)
  })
})
