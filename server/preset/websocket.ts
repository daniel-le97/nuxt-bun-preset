import type { WebSocketHandler } from 'bun'
import { insertMessage } from '../utils/db'
import { Server } from './server'



export const websocket: WebSocketHandler<{ socketId: string, auth: { id?: string, name?: string, image?: string }, channels: string[] }> = {
  open(ws) {
    console.log('server:ws:open', ws.data)
    ws.data.channels = []
  },
  async message(ws, message) {
    try {
      const msg = StringToWebSocketSchema(message as string)
      msg.data.createdAt = new Date().toString()
      if (msg.type === 'heartbeat') {
        const sent = ws.send('pong')
        // console.log('server:ws:heartbeat', message, sent)
        return void 0
      }
      else if (msg.type === 'subscribe') {
        console.log('server:ws:subscribe', msg.data.channel, ws.data.auth.id)
        ws.subscribe(msg.data.channel!)
        ws.data.channels.push(msg.data.channel!)
        addSubscription(msg.data.channel!, ws.data.auth.id!)
        // db.prepare('INSERT INTO subscriptions (channel, user) VALUES ($channel, $user)').run({ $channel: msg.data.channel!, $user: ws.data.auth.id! })
        Server().publish(msg.data.channel!, WebSocketSchemaToString({ type: 'subscribe', data: { channel: msg.data.channel!, auth: ws.data.auth } }))
        return void 0
      }
      else if (msg.type === 'unsubscribe') {
        console.log('server:ws:unsubscribe', msg.data.channel!, ws.data.auth.id)
        ws.unsubscribe(msg.data.channel!)
        ws.data.channels = ws.data.channels.filter(c => c !== msg.data.channel!)
        removeSubscription(msg.data.channel!, ws.data.auth.id!)
        // db.prepare('DELETE FROM subscriptions WHERE channel = $channel AND user = $user').run({ $channel: msg.data.channel!, $user: ws.data.auth.id! })
        ws.publish(msg.data.channel!, WebSocketSchemaToString({ type: 'unsubscribe', data: { channel: msg.data.channel!, auth: ws.data.auth } }))
        return void 0
      }
      else if (msg.type === 'publish') {
        console.log('server:ws:publish', msg.data.channel!, ws.data.auth.id)
        const message = msg.data
        const inserted = insertMessage(message.channel!, message.createdAt!, message.message!, ws.data.auth.id!)
        console.log({ inserted })
        const data = { channel: inserted.channel, message: inserted.message, auth: ws.data.auth, createdAt: inserted.createdAt, id: inserted.id.toString() }
        Server().publish(inserted.channel, WebSocketSchemaToString({ type: 'publish', data }))
        // const returnOne = db.transaction((record) => {
        //   const newRecord = db.prepare('INSERT INTO messages (channel, message, user, createdAt) VALUES ($1, $2, $3, $4)').get(record)
        //   const id = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }
        //   const newMessage = db.prepare(`
        //   SELECT
        //   messages.id,
        //   messages.channel,
        //   messages.message,
        //   messages.createdAt,
        //   users.name,
        //   users.id AS userId,
        //   users.image
        //   FROM
        //   messages
        //   JOIN
        //   users ON messages.user = users.id
        //   WHERE
        //   messages.id = $id;`)
        //     .get({ $id: id.id }) as MessageSchema

        //   if (newMessage.userId !== ws.data.auth.id)
        //     throw new Error('user id does not match')

        //   const data = { channel: newMessage.channel, message: newMessage.message, auth: ws.data.auth, createdAt: newMessage.createdAt, id: newMessage.id.toString() }

        //   Server().publish(newMessage.channel, WebSocketSchemaToString({ type: 'publish', data }))
        // })
        // returnOne({ $1: message.channel, $2: message.message!, $3: ws.data.auth.id!, $4: new Date().toString() })
        return void 0
      }
      else {
        console.log('server:ws:unknown', msg)
      }
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
        Server().publish(channel, WebSocketSchemaToString({ type: 'unsubscribe', data: { channel, auth: { id: ws.data.auth.id! } } }))
        ws.unsubscribe(channel)
        removeSubscription(channel, ws.data.auth.id!)
      })
      ws.unsubscribe(ws.data?.auth?.id)
    }
  },
}
