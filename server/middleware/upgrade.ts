

export default defineEventHandler(async (event) => {
  const headers = getHeaders(event)
  if (headers.connection === 'Upgrade' && headers.upgrade === 'websocket') {
      // console.log('test', event);
      const context = event.context
      const socketId = crypto.randomUUID()
      setHeader(event, 'x-socket-id', socketId)
      const session = await useAuthSession(event)
      if (session.data.id) {
        const auth = {
          id: session.data.id,
          name: session.data.name,
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${session.data.name}`,
        }
        const upgrade = context.server.upgrade(context.request, { data: { socketId, channels: [], auth} })
        const res = upgrade ? undefined : createError('unable to upgrade')
        return res
      }
  }
})