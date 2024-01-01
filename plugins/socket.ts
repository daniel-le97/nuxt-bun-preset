export default defineNuxtPlugin((nuxtApp) => {
  const ws = new WebSocket('ws://localhost:8002/ws')
  console.log('ws', ws.readyState)

  // ws.readyState.
  ws.addEventListener('open', (event) => {
    console.log('Connection open')

    ws.send('Hello Server!')
    ws.send(JSON.stringify({ type: 'message', data: 'Hello Server!' }))
  })
  ws.addEventListener('message', (event) => {
    // console.log('Message from server ', event.data)
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
    return unsubscribe
  }

  // ws.ping()
  return {
    provide: {
      ws,
      subscribe,
    },
  }
})
