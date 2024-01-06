import { type Server as BunServer, Glob, type ServerWebSocket, type WebSocketHandler } from 'bun'
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

  async function getGlob() {
    const nitro = useNitroApp()
    
    const path = `${process.cwd()}/server/handlers/`
    const glob = new Glob('*.ts')
    for await (const file of glob.scan(path)) {
      const fullPath = `${path}${file}`
      const handler = await import(fullPath)
      const key = file.replace('.ts', '')
      handlers.set(key, handler.default)
    }
    return handlers
  }
  const fileSystemHandlers = await getGlob()
  
export const websocket: WebSocketHandler<{ socketId: string, auth: { id?: string, name?: string, image?: string }, channels: string[] }> = {
  open(ws) {
    console.log('server:ws:open', ws.data)
  },
  async message(ws, message) {
    try {
      const msg = StringToWebSocketSchema(String(message))
      msg.data.createdAt = new Date().toString()
      const hasHandler = handlers.has(msg.type)
      const handler = hasHandler ? handlers.get(msg.type)! : handlers.get('unkown')!
      await handler(Server(), ws, msg)
      // if (msg.type === 'heartbeat') {
      //   const sent = ws.send('pong')
      //   // console.log('server:ws:heartbeat', message, sent)
      //   return void 0
      // }
      // else if (msg.type === 'subscribe') {
      //   console.log('server:ws:subscribe', msg.data.channel, ws.data.auth.id)
      //   ws.subscribe(msg.data.channel!)
      //   ws.data.channels.push(msg.data.channel!)
      //   addSubscription(msg.data.channel!, ws.data.auth.id!)
      //   // db.prepare('INSERT INTO subscriptions (channel, user) VALUES ($channel, $user)').run({ $channel: msg.data.channel!, $user: ws.data.auth.id! })
      //   Server().publish(msg.data.channel!, WebSocketSchemaToString({ type: 'subscribe', data: { channel: msg.data.channel!, auth: ws.data.auth } }))
      //   return void 0
      // }
      // else if (msg.type === 'unsubscribe') {
      //   console.log('server:ws:unsubscribe', msg.data.channel!, ws.data.auth)
      //   ws.unsubscribe(msg.data.channel!)
      //   ws.data.channels = ws.data.channels.filter(c => c !== msg.data.channel!)
      //   removeSubscription(msg.data.channel!, ws.data.auth.id!)
      //   // db.prepare('DELETE FROM subscriptions WHERE channel = $channel AND user = $user').run({ $channel: msg.data.channel!, $user: ws.data.auth.id! })
      //   console.log('user', { user: ws.data.auth })
      //   Server().publish(msg.data.channel!, WebSocketSchemaToString({ type: 'unsubscribe', data: { channel: msg.data.channel!, auth: ws.data.auth } }))
      //   return void 0
      // }
      // else if (msg.type === 'publish') {
      //   console.log('server:ws:publish', msg.data.channel!, ws.data.auth.id)
      //   const message = msg.data
      //   const inserted = insertMessage(message.channel!, message.createdAt!, message.message!, ws.data.auth.id!)
      //   console.log({ inserted })
      //   const data = { channel: inserted.channel, message: inserted.message, auth: ws.data.auth, createdAt: inserted.createdAt, id: inserted.id.toString() }
      //   Server().publish(inserted.channel, WebSocketSchemaToString({ type: 'publish', data }))
      //   return void 0
      // }
      // else if (msg.type === 'typing') {
      //   console.log('server:ws:typing', msg.data)
      //   ws.publish(msg.data.channel!, WebSocketSchemaToString({ type: 'typing', data: { channel: msg.data.channel!, auth: ws.data.auth } }))

      //   return void 0
      // }
      // else {
      //   console.log('server:ws:unknown', msg)
      // }
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