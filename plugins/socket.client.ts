export default defineNuxtPlugin(async (nuxtApp) => {
  const webSocket = new WebSocket('ws://localhost:8002/ws')
  // console.log('ws', webSocket.value.readyState)
  const auth = useAuth()
  // console.log('user', auth.session.value)

  // ws.readyState.
  webSocket.addEventListener('open', (event) => {
    console.log('Connection open')
    // webSocket.send('Hello Server!')
    if (auth.session.value?.id)
      webSocket.send(JSON.stringify({ type: 'auth', data: auth.session.value }))

    webSocket.send(JSON.stringify(({ type: 'subscribe', data: 'general' })))
  })
  webSocket.addEventListener('close', (event) => {
    console.log('Connection closed')
  })

  const subscribe = (channel: string, cb: (event: MessageEvent<string | Buffer>) => void) => {
    webSocket.send(JSON.stringify({ type: 'subscribe', data: channel }))
    const listener = (event: MessageEvent<string | Buffer>) => {
      console.log('event', event.type)
      // event.type
    }
    webSocket.addEventListener('message', cb)
    // webSocket.removeEventListener(type, listener)
    const unsubscribe = () => {
      webSocket.send(JSON.stringify({ type: 'unsubscribe', data: channel }))
      webSocket.removeEventListener('message', cb)
    }
    return { unsubscribe, send: (message: string) => webSocket.send(JSON.stringify({ type: 'publish', data: { channel, message } })) }
  }

  console.log('ws-connection', webSocket.readyState)

  // webSocket.ping()
  return {
    provide: {
      ws: webSocket,
      subscribe,
    },
  }
})
