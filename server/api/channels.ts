import type { User } from '../../models/User'
import { getMessagesAndUsers } from '../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  if (!query.channel)
    throw createError('missing channel query')

  const key = `channel:${query.channel}`

  const res = getMessagesAndUsers(key)

  const session = await requireAuthSession(event)

  // user is not in the channel is fetching the channel meaning they are subscribed
  // if they are not in the user
  const foundUser = res.users.find(user => user.id === session.data.id)
  if (!foundUser){
    const newUser = {
      id: session.data.id,
      name: session.data.name,
      image: `https://api.dicebear.com/7.x/initials/svg?seed=${session.data.name}`,
    }
    res.users.push(newUser as User)
  }

  return res
})
