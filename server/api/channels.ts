import type { NewMessage } from '../utils/message'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  if (!query.channel)
    throw createError('missing channel query')

  const key = `channel:${query.channel}`
  // const db = useStorage('db')
  // const items = await db.getItem(key)
  // return items
  const messages = db.prepare(`
  SELECT messages.id, messages.channel,
  messages.message, messages.createdAt,
  users.name, users.id as userId, users.image
  FROM messages
  JOIN users ON messages.user
  WHERE messages.channel = ?1
  ORDER BY messages.createdAt`).all(key)

  // console.log({ messages });

  return messages as NewMessage[]
})
