import '#internal/nitro/virtual/polyfill'
import { parentPort } from 'node:worker_threads'
import { websocket } from './websocket'
import { setServer } from './server'

// @ts-expect-error it is there
import { trapUnhandledNodeErrors } from '#internal/nitro/utils'

// console.log('custom dev server')
const nitroApp = useNitroApp()
// @ts-expect-error H3App is App
const handler = toWebHandler(nitroApp.h3App)

const server = Bun.serve({
  port: 9950,
  reusePort: true,
  async fetch(req, server) {
    return await handler(req, { server, request: req })
  },
  websocket,
})
setServer(server)

parentPort?.postMessage({
  event: 'listen',
  address: { host: 'localhost', port: server.port },
})

// Trap unhandled errors
trapUnhandledNodeErrors()

// Graceful shutdown
async function onShutdown(signal?: string) {
  server.stop(true)
  nitroApp.hooks.callHook('close')
  parentPort?.postMessage({ event: 'exit' })
  // await nitroApp.hooks.callHook('close')
}

parentPort?.on('message', async (msg) => {
  if (msg && msg.event === 'shutdown')
    await onShutdown()
})
