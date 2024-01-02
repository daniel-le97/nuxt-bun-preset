// handle websocker upgrade requests, we let nitro routes do it to have access to nitro middleware
export default defineEventHandler(async (event) => {
  const context = event.context
  const username = crypto.randomUUID()
  // const session = await useAuthSession(event)
  // console.log('user', session.data);

  const upgrade = context.server.upgrade(context.request, { data: { username } })
  const res = upgrade ? undefined : createError('unable to upgrade')
  return res
})
