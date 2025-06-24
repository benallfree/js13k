import { chunkString } from '@/common/util/chunkString'
import { Beat } from '@/components/BeatEditor/storage'
import { compressToBase62 } from '@/util/compress'

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
