// handle websocker upgrade requests, we let nitro routes do it to have access to nitro middleware
export default defineEventHandler(async (event) => {
  console.log('nitro:ws:handler')
  const context = event.context
  const socketId = crypto.randomUUID()
  // const cookie = getCookie(event, 'nuxt-session')
  const session = await useAuthSession(event)
  // console.log('cookie', cookie);
  // console.log('session', session.data);\
  let upgrade: boolean | undefined
  const res = upgrade ? undefined : createError('unable to upgrade')
  const channels: string[] = []
  if (session.data.id) {
    const auth = {
      id: session.data.id,
      name: session.data.name,
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${session.data.name}`,
    }
    upgrade = context.server.upgrade(context.request, { data: { socketId, auth, channels } })
    return res
  }
  upgrade = context.server.upgrade(context.request, { data: { socketId, channels } })
  return res
})
