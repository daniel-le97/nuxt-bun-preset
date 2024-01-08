import { Database } from 'bun:sqlite'

let _db: Database | null = null
if (!_db) {
  _db = new Database('db.sqlite')
  _db.exec('PRAGMA journal_mode = WAL;')
  _db.query('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT, email TEXT, password TEXT, image TEXT, createdAt TEXT);').run()
  _db.query('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, channel TEXT, message TEXT, user TEXT, createdAt TEXT);').run()
  _db.query('CREATE TABLE IF NOT EXISTS subscriptions (channel TEXT, user TEXT, UNIQUE(channel, user));').run()
}
export const db = _db
