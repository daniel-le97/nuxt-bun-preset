export default eventHandler(async (event) => {
  try {
    const session = await useAuthSession(event)
    const user = await findUserById(session.data.id)
    if (!user)
      await session.clear()

    return session.data
  }
  catch (error) {
    console.log('error', error)
  }
  try {
    console.log();
    
  } catch (error) {
    
  }
})

function handleCatch(error: any) {
  console.log('error', error)
  return { error }
}