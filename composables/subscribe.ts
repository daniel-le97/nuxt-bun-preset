export interface wsChannelEvents {
  type: 'publish' | 'subscribe' | 'unsubscribe' | 'auth'
  data: { channel: string, message?: string, event?: string, auth?: { id?: string, email?: string, name?: string, image?: string }, createdAt?: string | Date }
}

export function useSubscribe(channel: string, cb: (event: wsChannelEvents) => void) {
  const sub = useNuxtApp().$subscribe
  // console.log({ sub });

  const subscribe = sub(channel, cb)
  return subscribe
}
