import type { H3Event, SessionConfig } from 'h3'

import { useStorage } from '#imports'

const sessionConfig = (useRuntimeConfig().auth || {}) as SessionConfig

export interface AuthSession {
  id: string
  name: string
  email: string
  image: string
}

export async function useAuthSession(event: H3Event) {
  const session = await useSession<AuthSession>(event, sessionConfig)
  return session
}

export async function requireAuthSession(event: H3Event) {
  const session = await useAuthSession(event)
  if (!session.data.email || !session.id) {
    throw createError({
      message: 'Not Authorized',
      statusCode: 401,
    })
  }
  return session
}
