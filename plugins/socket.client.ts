interface wsChannelEvents {
  type: 'publish' | 'subscribe' | 'unsubscribe' | 'auth'
  data: { channel: string, message?: string, event?: string, auth?: { id: string, email: string, name: string }, createdAt?: string }
}

const send = (event: wsChannelEvents) => JSON.stringify(event)

export default defineNuxtPlugin(async (nuxtApp) => {
  const webSocket = new WebSocket('ws://localhost:8002/ws')
  // console.log('ws', webSocket.value.readyState)
  const auth = useAuth()
  // console.log('user', auth.session.value)

  // ws.readyState.
  webSocket.addEventListener('open', (event) => {
    console.log('Connection open')
    if (auth.session.value?.id) {
      useState('auth', () => auth.session.value)
      // console.log('user', auth.session.value)
      webSocket.send(send({ type: 'auth', data: { channel: auth.session.value.id, auth: auth.session.value } }))
    }

    // webSocket.send(JSON.stringify(({ type: 'subscribe', data: { channel: 'general' }})))
  })
  webSocket.addEventListener('close', (event) => {
    console.log('Connection closed')
  })

  const subscribe = (channel: string, cb: (event: wsChannelEvents) => void) => {
    webSocket.send(send({ type: 'subscribe', data: { channel } }))

    const newCb = (event: MessageEvent<string | Buffer>) => {
      const message = JSON.parse(event.data as string) as wsChannelEvents
      if (message.type === 'publish' && message.data.channel === channel)
        cb(message)
    }
    webSocket.addEventListener('message', newCb)
    // webSocket.removeEventListener(type, listener)
    const unsubscribe = () => {
      webSocket.send(send({ type: 'unsubscribe', data: { channel } }))
      webSocket.removeEventListener('message', newCb)
    }
    return { unsubscribe, send: (message: string) => webSocket.send(send({ type: 'publish', data: { channel, message } })) }
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
