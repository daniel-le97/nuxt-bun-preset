export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    throw createError('missing id')

  console.log('id', id)
  const key = `channel:${id}`
  const db = useStorage('db')
  const items = await db.getItem(key)
  console.log('items', items)
  return items
})
