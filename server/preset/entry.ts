import '#internal/nitro/virtual/polyfill'
import { websocket } from './websocket'
import { setServer } from './server'

const nitroApp = useNitroApp()
// @ts-expect-error it is there
const handler = toWebHandler(nitroApp.h3App)

const server = Bun.serve({
  port: process.env.NITRO_PORT || process.env.PORT || 3000,
  async fetch(req, server) {
    return handler(req, { server, request: req })
  },
  websocket,
})
setServer(server)

////console.log(`Listening on http://localhost:${server.port}...`)
