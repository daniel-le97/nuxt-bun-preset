export default defineNuxtPlugin(async (nuxtApp) => {
  await callOnce(() => {
    const ws = new WebSocket('ws://localhost:8002/ws')
    console.log('ws', ws.readyState)
    const auth = useAuth()
    console.log('user', auth.session.value)

    // ws.readyState.
    ws.addEventListener('open', (event) => {
      console.log('Connection open')
      // ws.send('Hello Server!')
      if (auth.session.value)
        ws.send(JSON.stringify({ type: 'auth', data: auth.session.value }))

      ws.send(JSON.stringify(({ type: 'subscribe', data: 'general' })))
    })
    ws.addEventListener('close', (event) => {
      console.log('Connection closed')
    })

    const subscribe = (channel: string, cb: (event: MessageEvent<string | Buffer>) => void) => {
      ws.send(JSON.stringify({ type: 'subscribe', data: channel }))
      const listener = (event: MessageEvent<string | Buffer>) => {
        console.log('event', event.type)
        // event.type
      }
      ws.addEventListener('message', cb)
      // ws.removeEventListener(type, listener)
      const unsubscribe = () => {
        ws.send(JSON.stringify({ type: 'unsubscribe', data: channel }))
        ws.removeEventListener('message', cb)
      }
      return {unsubscribe, send: (message: string) => ws.send(JSON.stringify({ type: 'publish', data: { channel, message } }))}
    }

    // ws.ping()
    return {
      provide: {
        ws,
        subscribe,
      },
    }
  })
})
