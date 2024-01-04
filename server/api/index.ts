export default defineEventHandler(async (event) => {
  const id = crypto.randomUUID()
  return `Hello World! ${id}`
})
