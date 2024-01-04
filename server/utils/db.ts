

export async function findUserByEmail(email: string) {
  const user = db.query('SELECT * FROM users WHERE email = $email').get({ $email: email }) as User | null
  return user
}

export async function findUserById(id: string) {
  const user = db.query('SELECT * FROM users WHERE id = $id').get({ $id: id }) as User | null
  return user
}
export async function createUser(user: { email: string, password: string, name: string, image: string, id: string }) {
  const newUser = db.query('INSERT INTO users (name, email, password, image, id, createdAt) VALUES ($name, $email, $password, $image, $id, $createdAt)').get({ $name: user.name, $email: user.email, $password: user.password, $image: user.image, $id: user.id, $createdAt: new Date().toString() }) as User
  return newUser
}