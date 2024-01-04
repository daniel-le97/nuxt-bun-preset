import { getMessagesAndUsers } from '../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  if (!query.channel)
    throw createError('missing channel query')

  const key = `channel:${query.channel}`

  return getMessagesAndUsers(key)
  // const db = useStorage('db')
  // const items = await db.getItem(key)
  // return items
  // const messages = db.prepare(`
  // SELECT
  //   messages.id,
  //   messages.channel,
  //   messages.message,
  //   messages.createdAt,
  //   users.name,
  //   users.id AS userId,
  //   users.image
  // FROM
  //   messages
  // JOIN
  //   users ON messages.user = users.id
  // WHERE
  //   messages.channel = ?1
  // ORDER BY
  //   messages.createdAt;`).all(key) as MessageSchema[]

  // const users = db.prepare(`
  //   SELECT
  //     users.id, users.name, users.image
  //   FROM
  //     subscriptions
  //   JOIN
  //     users ON subscriptions.user = users.id
  //   WHERE channel = ?1
  //   `).all(key) as User[]

  // // console.log({ messages, users })

  // return { messages, users }
})
