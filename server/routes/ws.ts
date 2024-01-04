// handle websocker upgrade requests, we let nitro routes do it to have access to nitro middleware
export default defineEventHandler(async (event) => {
  const context = event.context
  const socketId = crypto.randomUUID()
  // const cookie = getCookie(event, 'nuxt-session')
  const session = await useAuthSession(event)
  // console.log('cookie', cookie);
  // console.log('session', session.data);\
  let upgrade: boolean | undefined
  const res = upgrade ? undefined : createError('unable to upgrade')
  if (session.data.id) {
    console.log('ws:sessions', session.data)

    const auth = {
      id: session.data.id,
      name: session.data.name,
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${session.data.name}`,
    }
    upgrade = context.server.upgrade(context.request, { data: { socketId, auth } })
    return res
  }
  upgrade = context.server.upgrade(context.request, { data: { socketId } })
  return res
})
