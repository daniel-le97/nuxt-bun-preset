export interface User {
  id: string
  createdAt: string
  name: string
  email: string
  password: string
  image: string
}

export async function findUserByEmail(email: string) {
  const user = db.query('SELECT * FROM users WHERE email = $email').get({ $email: email }) as User | null
  return user
}

export async function findUserById(id: string) {
  const user = db.query('SELECT * FROM users WHERE id = $id').get({ $id: id }) as User | null
  return user
}
export async function createUser(user: { email: string, password: string, name: string, image: string, id: string }) {
  const newUser = db.query('INSERT INTO users (name, email, password, image, id, createdAt) VALUES ($name, $email, $password, $image, $id, $createdAt)').get({ $name: user.name, $email: user.email, $password: user.password, $image: user.image, $id: user.id, $createdAt: new Date().toString()}) as User
  return newUser
}

// export function updateUserByEmail(email: string, updates: Partial<User>) {
//   const user = db.query('UPDATE users SET name = $name, email = $email, password = $password, image = $image WHERE email = $email').run(updates)
//   return user
// }

// export async function findUserByEmail(email: string) {
//   const storage = useStorage('db')
//   const key = getUserKey(email!)
//   return await storage.getItem<User>(key)
// }

// export async function createUser(user: Partial<User>) {
//   const storage = useStorage('db')
//   const key = getUserKey(user.email!)
//   if (await storage.hasItem(key))
//     throw createError({ message: 'Email already exists!', statusCode: 409 })

//   return await storage.setItem(key, {
//     id: randomUUID(),
//     createdAt: new Date(),
//     ...user,
//   })
// }

// export async function updateUserByEmail(email: string, updates: Partial<User>) {
//   const storage = useStorage('db')
//   const user = await findUserByEmail(email)
//   if (!user)
//     throw createError('unable to find user')

//   const key = getUserKey(user.email)
//   return await storage.setItem(key, {
//     ...user,
//     ...updates,
//   })
// }

// function getUserKey(email: string) {
//   return `auth:users:${encodeURIComponent(email)}`
// }
