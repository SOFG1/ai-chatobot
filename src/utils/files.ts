import { getData, storeData } from '@/utils/pdfIndexedDB'
import axios from 'axios'

/**
 * Transforms bytes to a human-readable format (e.g. 1.23 MiB)
 * @param bytes Size in bytes
 * @param decimals Number of decimal places to round to
 */
export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Fetches the file from the backend `/api/files/download` and caches it in the IndexedDB
 * Returns the cached file as an object URL if it exists
 * @param fileUserId User ID from the FileUser object
 * @param fileName File name
 * @param original Whether to fetch the original file or the processed one
 */
export async function fetchAndCacheFile(fileUserId: string, fileName: string, original = false): Promise<string> {
  const data = await getData(fileUserId)

  if (data) {
    console.log('file found in cache')
    return URL.createObjectURL(data.blob)
  }

  const response = await axios.get(`/api/files/download/${fileUserId}/${fileName}?${original ? 'original=true' : ''}`, {
    responseType: 'blob'
  })
  // TODO: when downloading as original and the file is a DOCX this line below will not work.
  const blob = new Blob([response.data], { type: 'application/pdf' })
  await storeData(fileUserId, blob)

  return URL.createObjectURL(blob)
}
