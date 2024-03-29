export default eventHandler(async (event) => {
  const session = await useAuthSession(event)
  const { email, password } = await readBody(event) as Record<string, string>
  const user = await findUserByEmail(email)
  if (!user) {
    throw createError({
      message: 'Email not found! Please register.',
      statusCode: 401,
    })
  }
  if (!Bun.password.verify(password, user.password)) {
    throw createError({
      message: 'Incorrect password!',
      statusCode: 401,
    })
  }
  await session.update({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  })
  return session
})
