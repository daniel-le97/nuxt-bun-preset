// create a  websocket client that only resolves after the connection is open
// async function useWebsocket() {
//   // TODO change these to env variables or runtime config
//   const url = process.env.NODE_ENV !== 'production' ? 'ws://localhost:9950/ws' : 'ws://localhost:3000/ws'
//   return new Promise<WebSocket>((resolve, reject) => {
//     const ws = new WebSocket(url)
//     // const auth = useAuth()
//     ws.addEventListener('close', (event) => {
//       reject(event)
//     })

//     ws.addEventListener('open', (event) => {
//       console.log('Connection open')
//       // REVIEW - this is now handled by /ws nitro route
//       // if (auth.session.value?.id) {
//       //   useState('auth', () => auth.session.value)
//       //   console.log('user', auth.session.value)
//       //   ws.send(send({ type: 'auth', data: { channel: auth.session.value.id, auth: auth.session.value } }))
//       // }
//       useToast().add({ title: 'Connected' })
//       resolve(ws)
//     })
//     ws.addEventListener('error', (event) => {
//       reject(event)
//     })
//   })
// }
export default defineNuxtPlugin(async (nuxtApp) => {
  // const data = await $fetch('/api/server')
  // console.log('data', data, globalThis.window);

  // const webSocket = await useWebsocket()

  // const auth = useAuth()
  // if (!auth.session.value?.id)
  //   await navigateTo('/login')

  // const subscribe = (channel: string, cb: (event: wsChannelEvents) => void) => {
  //   if (process.env.NODE_ENV !== 'production')
  //     useToast().add({ title: `Subscribed to ${channel}` })
  //   const auth = useAuth().session.value!
  //   webSocket.send(send({ type: 'subscribe', data: { channel, auth } }))

  //   const filteredCallback = (event: MessageEvent<string | Buffer>) => {
  //     const message = JSON.parse(event.data as string) as wsChannelEvents
  //     if (message.data.channel && message.data.channel === channel)
  //       cb(message)
  //   }
  //   webSocket.addEventListener('message', filteredCallback)
  //   // webSocket.removeEventListener(type, listener)
  //   const unsubscribe = () => {
  //     if (process.env.NODE_ENV !== 'production')
  //       useToast().add({ title: `Unsubscribed from ${channel}` })

  //     webSocket.send(send({ type: 'unsubscribe', data: { channel, auth } }))
  //     webSocket.removeEventListener('message', filteredCallback)
  //   }
  //   return { unsubscribe, send: (message: string) => webSocket.send(send({ type: 'publish', data: { channel, message, auth } })) }
  // }
  // return {
  //   provide: {
  //     ws: webSocket,
  //     subscribe,
  //   },
  // }
})
