import type { StorageValue } from 'unstorage'
import { defineDriver } from 'unstorage'
import { Database } from 'bun:sqlite'

interface db {
  path?: string
  options?: number | { readonly?: boolean | undefined, create?: boolean | undefined, readwrite?: boolean | undefined } | undefined
  wal: boolean
}

export interface SQLITEStorageOptions {
  base?: string
  options?: number | { readonly?: boolean | undefined, create?: boolean | undefined, readwrite?: boolean | undefined } | undefined
  readOnly?: boolean
  noClear?: boolean
  wal?: boolean
}

type hello = StorageValue

export const sqliteDriver = defineDriver((options: SQLITEStorageOptions = {}) => {
  if (!options.base)
    throw new Error('Path is required')

  const db = new Database(options.base, options.options)
  if (options.wal)
    db.exec('PRAGMA journal_mode = WAL;')

  db.query('CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value BLOB);').run()

  return {
    name: 'my-custom-driver',
    options,
    hasItem(key, opts) {
      const result = db.query('SELECT key FROM kv WHERE kv.key = ?1').get(key)
      return !!result as boolean
    },
    getItem(key, _opts) {
      const value = db.query('SELECT value FROM kv WHERE kv.key = ?1').get(key)
      // console.log('getItem', { key, value });
      return value as string
    },
    setItem(key, value, _opts) {
      // console.log('setItem', { key, value });
      db.prepare('INSERT OR REPLACE INTO kv (key, value) VALUES ($key, $value)').run({ $key: key, $value: value })
    },
    removeItem(key, _opts) {
      db.prepare('DELETE FROM kv WHERE key = $key').run({ $key: key })
    },
    getKeys(base, _opts) {
      return db.query('SELECT key FROM kv WHERE kv.key LIKE ?1 %').all(base).flat() as string[]
    },
    clear(base, _opts) {
      if (options.noClear)
        return
      db.query('DELETE FROM kv where kv.key LIKE').run()
    },
    dispose() {
      db.close()
    },
  }
})
