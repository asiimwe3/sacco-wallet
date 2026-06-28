// Offline-first storage using IndexedDB via idb
import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface SaccoDB extends DBSchema {
  farmer: {
    key: string
    value: any
  }
  transactions: {
    key: string
    value: any
    indexes: { 'by-farmer': string }
  }
  loans: {
    key: string
    value: any
    indexes: { 'by-farmer': string }
  }
  market_prices: {
    key: string
    value: any
  }
  weather: {
    key: string
    value: any
  }
  pending_sync: {
    key: string
    value: { type: string; data: any; timestamp: number }
  }
}

let db: IDBPDatabase<SaccoDB> | null = null

export async function getDB() {
  if (!db) {
    db = await openDB<SaccoDB>('sacco-wallet', 1, {
      upgrade(db) {
        db.createObjectStore('farmer')
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' })
        txStore.createIndex('by-farmer', 'farmer_id')
        const loanStore = db.createObjectStore('loans', { keyPath: 'id' })
        loanStore.createIndex('by-farmer', 'farmer_id')
        db.createObjectStore('market_prices', { keyPath: 'id' })
        db.createObjectStore('weather', { keyPath: 'date' })
        db.createObjectStore('pending_sync', { keyPath: 'timestamp' })
      }
    })
  }
  return db
}

export async function saveFarmerOffline(farmer: any) {
  const db = await getDB()
  await db.put('farmer', farmer, farmer.id)
}

export async function getFarmerOffline(id: string) {
  const db = await getDB()
  return db.get('farmer', id)
}

export async function saveTransactionsOffline(txs: any[]) {
  const db = await getDB()
  const tx = db.transaction('transactions', 'readwrite')
  for (const t of txs) await tx.store.put(t)
  await tx.done
}

export async function getTransactionsOffline(farmerId: string) {
  const db = await getDB()
  return db.getAllFromIndex('transactions', 'by-farmer', farmerId)
}

export async function saveLoansOffline(loans: any[]) {
  const db = await getDB()
  const tx = db.transaction('loans', 'readwrite')
  for (const l of loans) await tx.store.put(l)
  await tx.done
}

export async function getLoansOffline(farmerId: string) {
  const db = await getDB()
  return db.getAllFromIndex('loans', 'by-farmer', farmerId)
}

export async function saveMarketPricesOffline(prices: any[]) {
  const db = await getDB()
  const tx = db.transaction('market_prices', 'readwrite')
  for (const p of prices) await tx.store.put(p)
  await tx.done
}

export async function getMarketPricesOffline() {
  const db = await getDB()
  return db.getAll('market_prices')
}

export async function saveWeatherOffline(data: any[]) {
  const db = await getDB()
  const tx = db.transaction('weather', 'readwrite')
  for (const w of data) await tx.store.put(w)
  await tx.done
}

export async function getWeatherOffline() {
  const db = await getDB()
  return db.getAll('weather')
}

export async function queueForSync(type: string, data: any) {
  const db = await getDB()
  const timestamp = Date.now()
  await db.put('pending_sync', { type, data, timestamp }, timestamp.toString())
}

export async function getPendingSync() {
  const db = await getDB()
  return db.getAll('pending_sync')
}

export async function clearPendingSync(timestamp: string) {
  const db = await getDB()
  await db.delete('pending_sync', timestamp)
}
