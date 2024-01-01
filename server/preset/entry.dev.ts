import '#internal/nitro/virtual/polyfill'
import { parentPort } from 'node:worker_threads'
import type { ServerWebSocket, WebSocketCompressor } from 'bun'

// @ts-expect-error it is there
import { trapUnhandledNodeErrors } from '#internal/nitro/utils'

const nitroApp = useNitroApp()
// const server = new Server(toNodeListener(nitroApp.h3App))

// nitroApp.router.get('/_nitro/health', ((event) => 'OK'))
console.log('custom dev server')
// function getAddress() {
//   if (
//     provider === 'stackblitz'
//     || process.env.NITRO_NO_UNIX_SOCKET
//     || process.versions.bun
//   )
//     return 0

//   const socketName = `worker-${process.pid}-${threadId}.sock`
//   if (isWindows) {
//     return join('\\\\.\\pipe\\nitro', socketName)
//   }
//   else {
//     const socketDir = join(tmpdir(), 'nitro')
//     mkdirSync(socketDir, { recursive: true })
//     return join(socketDir, socketName)
//   }
// }

// function getUnix(){
//   const socketName = `worker-${process.pid}-${threadId}.sock`;
//   const socketDir = join(tmpdir(), "nitro");
//     mkdirSync(socketDir, { recursive: true });
//     return join(socketDir, socketName);
// }

type ServerWS = ServerWebSocket<{ username: string }>
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
    const msg = `${ws.data?.username} has entered the chat`
    console.log(msg)
    ws.subscribe('general')
    // ws.publish("the-group-chat", msg);
  },
  message(ws, message) {
    console.log(`Received message ${message}`)

    // this is a group chat
    // so the server re-broadcasts incoming message to everyone
    ws.publish('general', `${ws.data.username}: ${message}`)
  },
  close(ws) {
    const msg = `${ws.data.username} has left the chat`
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
  // unix: getUnix(),
})

console.log('custom dev server pid', process.pid)

// nitroApp.hooks.hook(, function_)

parentPort?.postMessage({
  event: 'listen',
  address: { host: 'localhost', port: server.port },
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
