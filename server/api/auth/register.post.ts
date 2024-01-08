export default eventHandler(async (event) => {
  const { email, password } = await readBody(event)
  const name = email.split('@')[0]
  await createUser({
    id: crypto.randomUUID(),
    email,
    name,
    image: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
    password: await Bun.password.hash(password),
  })
  return {
    message: 'Successfully registered!',
  }
})
