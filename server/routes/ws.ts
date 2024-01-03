// handle websocker upgrade requests, we let nitro routes do it to have access to nitro middleware
export default defineEventHandler(async (event) => {
  const context = event.context
  const socketId = crypto.randomUUID()
  const upgrade = context.server.upgrade(context.request, { data: { socketId } })
  const res = upgrade ? undefined : createError('unable to upgrade')
  return res
})
