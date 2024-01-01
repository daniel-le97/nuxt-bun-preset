export default defineEventHandler(async (event) => {
  const context = event.context
  return context.server?.port
})
