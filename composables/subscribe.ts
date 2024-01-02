export interface wsChannelEvents {
  type: 'publish' | 'subscribe' | 'unsubscribe' | 'auth'
  data: { channel: string, message?: string, event?: string, auth?: { id: string, email: string, name: string } }
}

export function useSubscribe(channel: string, cb: (event: wsChannelEvents) => void) {
  const sub = useNuxtApp().$subscribe
  const subscribe = sub(channel, cb)
  return subscribe
}
