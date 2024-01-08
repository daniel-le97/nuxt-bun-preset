import type { MessageSchema } from '../../models/Message'

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

export function addSubscription(channel: string, user: string) {
  // console.log('addSubscription', { channel, user });
  const found = db.prepare('SELECT * FROM subscriptions WHERE channel = $channel AND user = $user').get({ $channel: channel, $user: user })
  if (found)
    return
  db.prepare('INSERT INTO subscriptions (channel, user) VALUES ($channel, $user)').run({ $channel: channel, $user: user })
}
export function removeSubscription(channel: string, user: string) {
  // console.log('removeSubscription', { channel, user });
  db.prepare('DELETE FROM subscriptions WHERE channel = $channel AND user = $user').run({ $channel: channel, $user: user })
}
export function getSubscriptionsByUserId(user: string) {
  const subscriptions = db.prepare('SELECT * FROM subscriptions WHERE user = $user').all({ $user: user }) as { channel: string, user: string }[]
  return subscriptions
}

export function getMessagesAndUsers(key: string) {
  const messages = db.query(`
  SELECT
    messages.id,
    messages.channel,
    messages.message,
    messages.createdAt,
    users.name,
    users.id AS userId,
    users.image
  FROM
    messages
  JOIN
    users ON messages.user = users.id
  WHERE
    messages.channel = ?1
  ORDER BY
    messages.createdAt;`).all(key) as MessageSchema[]

  const users = db.query(`
    SELECT
      users.id, users.name, users.image
    FROM
      subscriptions
    JOIN 
      users ON subscriptions.user = users.id
    WHERE subscriptions.channel = ?1
    `).all(key) as User[]

  return { messages, users }
}

export function insertMessage(channel: string, createdAt: string, message: string, user: string) {
  let newInsert: MessageSchema | null = null
  const returnOne = db.transaction((record) => {
    const newRecord = db.prepare('INSERT INTO messages (channel, message, user, createdAt) VALUES ($1, $2, $3, $4)').get(record)
    const id = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }
    const newMessage = db.prepare(`
    SELECT
      messages.id,
      messages.channel,
      messages.message,
      messages.createdAt,
      users.name,
      users.id AS userId,
      users.image
    FROM
      messages
    JOIN
      users ON messages.user = users.id
    WHERE
      messages.id = $id;`)
      .get({ $id: id.id }) as MessageSchema

    newInsert = newMessage
    if (newMessage.userId !== user)
      throw new Error('user id does not match')
  })
  returnOne({ $1: channel, $2: message, $3: user, $4: createdAt })
  if (!newInsert)
    throw new Error('insert failed')

  return newInsert as MessageSchema
}
