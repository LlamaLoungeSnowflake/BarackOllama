import { openDB } from 'idb'

const DB_NAME = 'barackollama'
const DB_VERSION = 1
const STORE_NAME = 'cache'

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    },
  })
}

export async function dbGet<T>(key: string): Promise<T | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, key)
}

export async function dbSet(key: string, value: unknown): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, value, key)
}

export async function dbClear(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}
