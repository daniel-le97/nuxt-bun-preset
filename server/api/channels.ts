import { getMessagesAndUsers } from '../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  if (!query.channel)
    throw createError('missing channel query')

  const key = `channel:${query.channel}`

  return getMessagesAndUsers(key)
})
