import type { ServerWebSocket, WebSocketCompressor } from 'bun'
import type { NewMessage } from '../utils/message'
import { Server } from './server'

export interface WebSocketHandler<T> {
  message: (
    ws: ServerWebSocket<T>,
    message: string | Buffer,
  ) => void | Promise<void>
  open?: (ws: ServerWebSocket<T>) => void
  close?: (ws: ServerWebSocket<T>) => void
  error?: (ws: ServerWebSocket<T>, error: Error) => void
  drain?: (ws: ServerWebSocket<T>) => void
  perMessageDeflate?:
    | boolean
    | {
      compress?: boolean | WebSocketCompressor
      decompress?: boolean | WebSocketCompressor
    }
}

export interface Message {
  type: 'auth' | 'subscribe' | 'unsubscribe' | 'publish'
  data: { channel: string, message?: string, auth?: { id?: string, name?: string, image?: string }, createdAt?: Date | string }
}

export function publish(event: Message) {
  return JSON.stringify(event)
}

export const websocket: WebSocketHandler<{ socketId: string, auth: { id?: string, name?: string, image?: string }, channels: string[] }> = {
  open(ws) {
    ws.subscribe('general')
    ws.data.channels = []
  },
  async message(ws, message) {
    const msg = JSON.parse(message as string) as Message
    msg.data.createdAt = new Date()

    if (msg.type === 'auth') {
      // console.log('auth', message)
      ws.data.auth = {
        id: msg.data.auth?.id,
        name: msg.data.auth?.name,
        image: msg.data.auth?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.data.auth?.name}`,
      }
      ws.subscribe(ws.data.auth.id!)
      return void 0
    }
    else if (msg.type === 'subscribe') {
      ws.subscribe(msg.data.channel)
      ws.data.channels.push(msg.data.channel)
      Server().publish(msg.data.channel, publish({ type: 'subscribe', data: { channel: msg.data.channel, auth: ws.data.auth } }))
      return void 0
    }
    else if (msg.type === 'unsubscribe') {
      ws.unsubscribe(msg.data.channel)
      ws.publish(msg.data.channel, publish({ type: 'unsubscribe', data: { channel: msg.data.channel, auth: ws.data.auth } }))
      ws.data.channels = ws.data.channels.filter(c => c !== msg.data.channel)
      return void 0
    }
    else if (msg.type === 'publish') {
      const message = msg.data
      // console.log({ message })

      // Server().publish(msg.data.channel, publish(msg))
      const returnOne = db.transaction((record) => {
        const newRecord = db.prepare('INSERT INTO messages (channel, message, user, createdAt) VALUES ($1, $2, $3, $4)').get(record)
        const id = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }
        const newMessage = db.prepare(`
        SELECT messages.id, messages.channel, messages.message, messages.createdAt, users.name, users.id as userId, users.image
        FROM messages JOIN users ON messages.user WHERE messages.id = $id`)
          .get({ $id: id.id }) as NewMessage
        Server().publish(newMessage.channel, publish({ type: 'publish', data: newMessage }))
      })
      returnOne({ $1: message.channel, $2: message.message!, $3: ws.data.auth.id!, $4: new Date().toString() })
      return void 0
    }
    else {
      // console.log('unknown message', msg)
    }
  },
  drain(ws) {
    console.log('drain', ws.data)
  },
  close(ws) {
    // console.log('close', ws.data)
    ws.data.channels.forEach((channel) => {
      ws.publish(channel, publish({ type: 'unsubscribe', data: { channel, auth: { id: ws.data.auth.id! } } }))
      ws.unsubscribe(channel)
    })
    if (ws.data?.auth?.id)
      ws.unsubscribe(ws.data?.auth?.id)
    // ws.isSubscribed(topic)

    ws.unsubscribe(ws.data.socketId)
    ws.unsubscribe('general')
  },
}
