import '#internal/nitro/virtual/polyfill'
import { parentPort, threadId } from 'node:worker_threads'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import type { ServerWebSocket, WebSocketCompressor } from 'bun'

// @ts-expect-error it is there
import { trapUnhandledNodeErrors } from '#internal/nitro/utils'

const nitroApp = useNitroApp()
console.log('custom dev server')

type ServerWS = ServerWebSocket<{ username: string, auth: {id:string, email:string, name:string}, channels: string[] }>
interface WebSocketHandler {
  message: (
    ws: ServerWS,
    message: string | ArrayBuffer | Uint8Array,
  ) => void
  open?: (ws: ServerWS) => void
  close?: (ws: ServerWS) => void
  error?: (ws: ServerWS, error: Error) => void
  drain?: (ws: ServerWS) => void
  perMessageDeflate?:
    | boolean
    | {
      compress?: boolean | WebSocketCompressor
      decompress?: boolean | WebSocketCompressor
    }
}
const websocket: WebSocketHandler = {
  open(ws) {
    ws.subscribe('general')
    ws.data.channels = []
  },
  message(ws, message) {
    console.log(ws.data);
    
    const msg = JSON.parse(message as string) as { type: string, data: any }
    if (msg.type === 'auth') {
      ws.data.auth = msg.data
      ws.subscribe(msg.data.id)
    }
    else if (msg.type === 'subscribe') {
      ws.subscribe(msg.data)
      ws.data.channels.push(msg.data)
    }
    else if (msg.type === 'unsubscribe') {
      ws.unsubscribe(msg.data)
      ws.publish(msg.data, ws.data.auth.name)
      ws.data.channels = ws.data.channels.filter((c) => c !== msg.data)
    }
    else if (msg.type === 'publish') {
      ws.publish(msg.data.channel, msg.data.message)
    }
    else {
      console.log('unknown message', msg)
    }
    // console.log(`Received message ${message}`)
  },
  close(ws) {
    console.log('close', ws.data);
    ws.unsubscribe(ws.data.auth.id)
    ws.unsubscribe('general')
  },
}
const server = Bun.serve<{ username: string }>({
  port: 8002,
  reusePort: true,
  async fetch(req, server) {
    // @ts-expect-error it is there
    const handler = toWebHandler(nitroApp.h3App)
    return await handler(req, { server, request: req })
  },
  websocket,
})

// console.log('custom dev server pid', process.pid)

// nitroApp.hooks.hook(, function_)

parentPort?.postMessage({
  event: 'listen',
  address: { host: 'localhost', port: server.port },
  // address: { socketPath: getUnix()},
})

// Trap unhandled errors
trapUnhandledNodeErrors()

// Graceful shutdown
async function onShutdown(signal?: string) {
  server.reload(server)
  await nitroApp.hooks.callHook('close')
}

parentPort?.on('message', async (msg) => {
  if (msg && msg.event === 'shutdown') {
    await onShutdown()
    parentPort?.postMessage({ event: 'exit' })
  }
})
