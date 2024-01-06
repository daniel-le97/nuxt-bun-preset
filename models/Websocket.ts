import { z } from 'zod'

const webSocketSchema = z.object({
  type: z.enum(['publish', 'subscribe', 'unsubscribe', 'auth', 'heartbeat', 'typing', 'tests']),
  data: z.object({
    channel: z.string().optional(),
    message: z.string().optional(),
    event: z.string().optional(),
    auth: z.object({
      id: z.string().optional(),
      email: z.string().optional(),
      name: z.string().optional(),
      image: z.string().optional(),
    }).optional(),
    createdAt: z.string().optional(),
    id: z.string().optional(),
  }),
})

export interface WebSocketSchema {
  type: 'publish' | 'subscribe' | 'unsubscribe' | 'auth' | 'heartbeat' | 'typing' | 'tests'
  data: {
    channel?: string
    message?: string
    event?: string
    auth?: {
      id?: string
      email?: string
      name?: string
      image?: string
    }
    createdAt?: string
    id?: string
  }

}

export function StringToWebSocketSchema(string: string) {
  const message = JSON.parse(string)
  const data = webSocketSchema.parse(message)
  return data as WebSocketSchema
}

export const parse = z
  .function()
  .args(webSocketSchema) // accepts an arbitrary number of arguments
  .returns(z.string())
  .implement((x) => {
    // TypeScript knows x is a string!
    return JSON.stringify(x)
  })

export const unparse = z
  .function()
  .args(z.string()) // accepts an arbitrary number of arguments
  .returns(webSocketSchema)
  .implement((x) => {
    const message = webSocketSchema.parse(x)
    // TypeScript knows x is a string!
    return message as WebSocketSchema
  })

export const WsParser = {
  parse,
  stringify: unparse,
}
// for some reason client will not accept this type
export type WsSchema = z.infer<typeof webSocketSchema>

export function WebSocketSchemaToString(data: WebSocketSchema) {
  return JSON.stringify(webSocketSchema.parse(data))
}
