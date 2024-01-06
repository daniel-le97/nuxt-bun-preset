import { z } from 'zod'

export interface MessageSchema {
  id: number
  channel: string
  message: string
  createdAt: string
  name: string
  userId: string
  image: string
}

const messageSchema = z.object({
  id: z.number(),
  channel: z.string(),
  message: z.string(),
  createdAt: z.string(),
  name: z.string(),
  userId: z.string(),
  image: z.string(),
}).passthrough()

export function StringToMessage(string: string) {
  const message = JSON.parse(string)
  return messageSchema.parse(message)
}

export function MessageToString(data: MessageSchema) {
  return JSON.stringify(messageSchema.parse(data))
}
