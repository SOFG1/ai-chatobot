import { openDB } from 'idb'

const pdfsStoreName = 'pdf-store'

//This function creates an IndexedDB database
async function setupDB() {
  return openDB('database', 1, {
    upgrade(db) {
      // Create an object store if it doesn't exist
      if (!db.objectStoreNames.contains(pdfsStoreName)) {
        db.createObjectStore(pdfsStoreName, { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

//Create item in Indexed DB
export async function storeData(id: string, blob: Blob) {
  const db = await setupDB()
  await db.put(pdfsStoreName, { id, blob })
}

//Retrieve item
export async function getData(id: string) {
  const db = await setupDB()
  const data = await db.get(pdfsStoreName, id)
  return data
}

export async function clearDB() {
  const db = await setupDB()
  await db.clear(pdfsStoreName)
}
