export default eventHandler(async (event) => {
  const session = await useAuthSession(event)
  console.log('session', session.data)

  return session.data
})
