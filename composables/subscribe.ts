export function useSubscribe(channel: string, cb: (event: MessageEvent<string | Buffer>) => void) {
  const sub = useNuxtApp().$subscribe
  const subscribe = sub(channel, cb)
  return subscribe
}
