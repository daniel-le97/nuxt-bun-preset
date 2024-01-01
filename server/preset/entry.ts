import '#internal/nitro/virtual/polyfill'
import type { WebSocketCompressor } from 'bun'

const nitroApp = useNitroApp()
// @ts-expect-error it is there
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
  async fetch(req, server) {
    // @ts-expect-error it is there
    const handler = toWebHandler(nitroApp.h3App)
    return await handler(req, { server, request: req })
  },
  websocket,
  // unix: getUnix(),
})
console.log(`Listening on http://localhost:${server.port}...`)
