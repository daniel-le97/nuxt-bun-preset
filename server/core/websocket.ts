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
    addSubscription(channel, auth.id!)
    server.publish(channel, WebSocketSchemaToString({ type: 'subscribe', data: { channel, auth } }))
  })

  .set('unsubscribe', (server, ws, payload) => {
    const channel = payload.data.channel!
    const auth = ws.data.auth
    ws.unsubscribe(channel)
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

export const websocket: WebSocketHandler<{ socketId: string, auth: { id?: string, name?: string, image?: string }, channels: string[] }> = {
  open(ws) {
    // i should probably do something here
  },
  async message(ws, message) {
    try {
      if (message === 'pong')
        return

      const msg = StringToWebSocketSchema(String(message))
      msg.data.createdAt = new Date().toString()
      const hasHandler = handlers.has(msg.type)

      const handler = hasHandler ? handlers.get(msg.type) : handlers.get('unkown')!
      return await handler?.(Server(), ws, msg)
    }
    catch (error) {
      console.error('server:ws:catch-error', error)
    }
  },
  drain(ws) {
    console.log('server:ws:drain', ws.data)
  },
  close(ws) {
    try {
      if (!ws.data?.auth?.id)
        return

      const subscriptions = getSubscriptionsByUserId(ws.data.auth.id)
      subscriptions.forEach((sub) => {
        Server().publish(sub.channel, WebSocketSchemaToString({ type: 'unsubscribe', data: { channel: sub.channel, auth: ws.data.auth } }))
        ws.unsubscribe(sub.channel)
        removeSubscription(sub.channel, ws.data.auth.id!)
      })
    }
    catch (error) {
      console.error('server:ws:close', error)
    }
  },
}
