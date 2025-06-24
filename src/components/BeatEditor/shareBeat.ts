import { chunkString, compressToBase62 } from '@van13k'
import { Beat } from './storage'

export const shareBeat = async (beat: Beat) => {
  const compressedBeatData = await compressToBase62(beat)
  console.log(`Compression: ${btoa(JSON.stringify(beat)).length}->${compressedBeatData.length}`)
  // Base62 is already URL-safe, no need for encodeURIComponent
  const urlSafe = compressedBeatData
  // Split into chunks
  const encodedChunks = chunkString(urlSafe)
  console.log('Chunks out', encodedChunks)

  return `${window.location.origin}/import/${encodedChunks.join('/')}`
}
