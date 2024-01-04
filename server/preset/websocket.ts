import type { ServerWebSocket, WebSocketCompressor, WebSocketHandler } from 'bun'

// import channels from '../api/channels'
import { Server } from './server'

// export interface Message {
//   type: 'auth' | 'subscribe' | 'unsubscribe' | 'publish'
//   data: { channel: string, message?: string, auth?: { id?: string, name?: string, image?: string }, createdAt?: Date | string }
// }

// export function publish(event: Message) {
//   return JSON.stringify(event)
// }
export function addSubscription(channel: string, user: string) {
  // console.log('addSubscription', { channel, user });
  const found = db.prepare('SELECT * FROM subscriptions WHERE channel = $channel AND user = $user').get({ $channel: channel, $user: user })
  if (found)
    return
  db.prepare('INSERT INTO subscriptions (channel, user) VALUES ($channel, $user)').run({ $channel: channel, $user: user })
}
export function removeSubscription(channel: string, user: string) {
  // console.log('removeSubscription', { channel, user });
  db.prepare('DELETE FROM subscriptions WHERE channel = $channel AND user = $user').run({ $channel: channel, $user: user })
}
export const websocket: WebSocketHandler<{ socketId: string, auth: { id?: string, name?: string, image?: string }, channels: string[] }> = {
  open(ws) {
    console.log('open:ws', ws.data)

    ws.subscribe('general')
    ws.data.channels = []
  },
  async message(ws, message) {
    try {
      console.log('message:server:ws', ws.data)

      const msg = StringToWebSocketSchema(message as string)
      msg.data.createdAt = new Date().toString()

      if (msg.type === 'auth') {
        console.log('auth:server', message)
        ws.data.auth = {
          id: msg.data.auth?.id,
          name: msg.data.auth?.name,
          image: msg.data.auth?.image || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.data.auth?.name}`,
        }
        ws.subscribe(ws.data.auth.id!)
        return void 0
      }
      else if (msg.type === 'subscribe') {
        console.log('subscribe-server', msg.data.channel, ws.data.auth.id)
        ws.subscribe(msg.data.channel)
        ws.data.channels.push(msg.data.channel)
        addSubscription(msg.data.channel, ws.data.auth.id!)
        // db.prepare('INSERT INTO subscriptions (channel, user) VALUES ($channel, $user)').run({ $channel: msg.data.channel, $user: ws.data.auth.id! })
        Server().publish(msg.data.channel, WebSocketSchemaToString({ type: 'subscribe', data: { channel: msg.data.channel, auth: ws.data.auth } }))
        return void 0
      }
      else if (msg.type === 'unsubscribe') {
        console.log('unsubscribe-server', msg.data.channel, ws.data.auth.id)
        ws.unsubscribe(msg.data.channel)
        ws.data.channels = ws.data.channels.filter(c => c !== msg.data.channel)
        removeSubscription(msg.data.channel, ws.data.auth.id!)
        // db.prepare('DELETE FROM subscriptions WHERE channel = $channel AND user = $user').run({ $channel: msg.data.channel, $user: ws.data.auth.id! })
        ws.publish(msg.data.channel, WebSocketSchemaToString({ type: 'unsubscribe', data: { channel: msg.data.channel, auth: ws.data.auth } }))
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
          SELECT
          messages.id,
          messages.channel,
          messages.message,
          messages.createdAt,
          users.name,
          users.id AS userId,
          users.image
          FROM
          messages
          JOIN
          users ON messages.user = users.id
          WHERE
          messages.id = $id;`)
            .get({ $id: id.id }) as MessageSchema

          if (newMessage.userId !== ws.data.auth.id)
            throw new Error('user id does not match')

          const data = { channel: newMessage.channel, message: newMessage.message, auth: ws.data.auth, createdAt: newMessage.createdAt }

          Server().publish(newMessage.channel, WebSocketSchemaToString({ type: 'publish', data }))
        })
        returnOne({ $1: message.channel, $2: message.message!, $3: ws.data.auth.id!, $4: new Date().toString() })
        return void 0
      }
      else {
        console.log('unknown message', msg)
      }
    }
    catch (error) {
      console.error('message:error', error)
    }
  },
  drain(ws) {
    console.log('drain', ws.data)
  },
  close(ws) {
    // console.log('close', ws.data)
    if (ws.data?.auth?.id) {
      ws.data.channels.forEach((channel) => {
        console.log('unsubscribe-close', channel)

        Server().publish(channel, WebSocketSchemaToString({ type: 'unsubscribe', data: { channel, auth: { id: ws.data.auth.id! } } }))
        ws.unsubscribe(channel)
        removeSubscription(channel, ws.data.auth.id!)
      })
      ws.unsubscribe(ws.data?.auth?.id)
    }
    // ws.isSubscribed(topic)

    ws.unsubscribe(ws.data.socketId)
    ws.unsubscribe('general')
  },
}
