import '#internal/nitro/virtual/polyfill'
import { parentPort } from 'node:worker_threads'
import type { ServerWebSocket, WebSocketCompressor } from 'bun'

// @ts-expect-error it is there
import { trapUnhandledNodeErrors } from '#internal/nitro/utils'

const nitroApp = useNitroApp()
console.log('custom dev server')

type ServerWS = ServerWebSocket<{ username: string, auth: { id?: string, email?: string, name?: string, image?: string }, channels: string[] }>
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

interface Message {
  type: 'auth' | 'subscribe' | 'unsubscribe' | 'publish'
  data: { channel: string, message?: string, event?: string, auth?: { id?: string, email?: string, name?: string, image?:string }, createdAt?: Date }
}

function publish(event: Message) {
  return JSON.stringify(event)
}

const websocket: WebSocketHandler = {
  open(ws) {
    ws.subscribe('general')
    ws.data.channels = []
  },
  async message(ws, message) {
    const msg = JSON.parse(message as string) as Message
    msg.data.createdAt = new Date()
    console.log('ws-message', msg)

    if (msg.type === 'auth') {
      console.log('auth', message)
      ws.data.auth = msg.data.auth!
      ws.data.auth.image = `https://api.dicebear.com/7.x/initials/svg?seed=${ws.data.auth.name}`
      ws.subscribe(ws.data.auth.id!)
    }
    else if (msg.type === 'subscribe') {
      ws.subscribe(msg.data.channel)
      ws.data.channels.push(msg.data.channel)
    }
    else if (msg.type === 'unsubscribe') {
      ws.unsubscribe(msg.data.channel)
      ws.publish(msg.data.channel, publish({ type: 'publish', data: { channel: msg.data.channel, event: 'user:leave', auth: { id: ws.data.auth.id! } } }))
      ws.data.channels = ws.data.channels.filter(c => c !== msg.data.channel)
    }
    else if (msg.type === 'publish') {
      const db = useStorage('db')
      msg.data.auth = { id: ws.data.auth.id!, name: ws.data.auth.name!, image: ws.data.auth.image! }
      ws.publish(msg.data.channel, publish(msg))
      const messages = await db.getItem(msg.data.channel) as Message['data'][] || []
      messages.push(msg.data)
      db.setItem(msg.data.channel, messages)
    }
    else {
      console.log('unknown message', msg)
    }
  },
  close(ws) {
    console.log('close', ws.data)
    ws.data.channels.forEach((c) => {
      ws.publish(c, publish({ type: 'publish', data: { channel: c, event: 'user:leave', auth: { id: ws.data.auth.id! } } }))
    })
    ws.unsubscribe(ws.data.auth.id!)
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
