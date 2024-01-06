import { z } from 'zod'

export interface User {
  id: string
  createdAt: string
  name: string
  email: string
  password: string
  image: string
}

const userSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  image: z.string(),
}).passthrough()
