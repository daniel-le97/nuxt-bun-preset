import type { Server, ServerWebSocket } from 'bun'

export type WS = ServerWebSocket<{
  socketId: string
  auth: {
    id?: string | undefined
    name?: string | undefined
    image?: string | undefined
  }
  channels: string[]
}>

export type SocketHandler = (server: Server, ws: WS, payload: WebSocketSchema) => void | Promise<void>

export const defineSocketHandler: (handler: SocketHandler) => SocketHandler = (handler) => {
  return async (server, ws, payload) => {
    await handler(server, ws, payload)
  }
}
