import type { Server as BunServer, ServerWebSocket, WebSocketHandler } from 'bun'
import { insertMessage } from '../utils/db'
import type { WebSocketSchema } from '../../models/Websocket'
import { Server } from './server'

type WS = ServerWebSocket<{
  socketId: string
  auth: {
    id?: string | undefined
    name?: string | undefined
    image?: string | undefined
  }
  channels: string[]
}>

const handlers = new Map<string, (server: BunServer, ws: WS, payload: WebSocketSchema) => void | Promise<void>>()

  .set('publish', (server, ws, payload) => {
    const inserted = insertMessage(payload.data.channel!, payload.data.createdAt!, payload.data.message!, ws.data.auth.id!)
    const data = { ...inserted, auth: ws.data.auth, id: inserted.id.toString() }
    server.publish(inserted.channel, WebSocketSchemaToString({ type: 'publish', data }))
  })

  .set('subscribe', (server, ws, payload) => {
    const channel = payload.data.channel!
    const auth = ws.data.auth
    ws.subscribe(channel)
    ws.data.channels.push(channel)
    addSubscription(channel, auth.id!)
    server.publish(channel, WebSocketSchemaToString({ type: 'subscribe', data: { channel, auth } }))
  })

  .set('unsubscribe', (server, ws, payload) => {
    const channel = payload.data.channel!
    const auth = ws.data.auth
    ws.unsubscribe(channel)
    ws.data.channels = ws.data.channels.filter(c => c !== channel)
    removeSubscription(channel, auth.id!)
    server.publish(channel, WebSocketSchemaToString({ type: 'unsubscribe', data: { channel, auth } }))
  })

  .set('typing', (server, ws, payload) => {
    const channel = payload.data.channel!
    ws.publish(channel, WebSocketSchemaToString({ type: 'typing', data: { channel, auth: ws.data.auth } }))
  })
  .set('unkown', (server, ws, payload) => {
    console.log('server:ws:unknown', payload)
  })
  .set('heartbeat', (server, ws, payload) => {
    const sent = ws.send('pong')
  })

// function dir() {
//   if (process.env.NODE_ENV === 'production')
//     return `${process.cwd()}/.output/server/handlers`

//   return `${process.cwd()}/.nuxt/handlers`
// }
// const _handlers = new Bun.FileSystemRouter({
//   dir: dir(),
//   style: 'nextjs',
// })

// for await (const [route, path] of Object.entries(_handlers.routes)) {
//   if (!route.includes('chunk'))
//     handlers.set(route.replace('/', ''), (await import(path)).default)
// }

export const websocket: WebSocketHandler<{ socketId: string, auth: { id?: string, name?: string, image?: string }, channels: string[] }> = {
  sendPings: true,
  open(ws) {
    // console.log('server:ws:open', ws.data)
  },
  async message(ws, message) {
    try {
      if (message === 'pong')
        return
      const msg = StringToWebSocketSchema(String(message))
      msg.data.createdAt = new Date().toString()
      const hasHandler = handlers.has(msg.type)
      console.log('server:ws:message', msg.type)

      const handler = hasHandler ? handlers.get(msg.type)! : handlers.get('unkown')!
      await handler(Server(), ws, msg)
    }
    catch (error) {
      console.error('server:ws:catch-error', error)
    }
  },
  drain(ws) {
    console.log('server:ws:drain', ws.data)
  },
  close(ws) {
    if (ws.data?.auth?.id) {
      console.log('server:ws:close', ws.data.auth.id)
      ws.data.channels.forEach((channel) => {
        Server().publish(channel, WebSocketSchemaToString({ type: 'unsubscribe', data: { channel, auth: ws.data.auth } }))
        ws.unsubscribe(channel)
        removeSubscription(channel, ws.data.auth.id!)
      })
      ws.unsubscribe(ws.data?.auth?.id)
    }
  },
}
