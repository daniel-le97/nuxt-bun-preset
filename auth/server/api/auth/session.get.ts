import { findUserById } from '../../utils/db'

export default eventHandler(async (event) => {
  const session = await useAuthSession(event)
  const user = await findUserById(session.data.id)
  if (!user)
    await session.clear()

  return session.data
})
