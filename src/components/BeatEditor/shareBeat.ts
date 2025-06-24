import { chunkString } from '@/common/util/chunkString'
import { Beat } from '@/components/BeatEditor/storage'
import { compressToBase64 } from '@/util/compress'

export const shareBeat = async (beat: Beat) => {
  const compressedBeatData = await compressToBase64(beat)
  console.log(`Compression: ${btoa(JSON.stringify(beat)).length}->${compressedBeatData.length}`)
  // Split into chunks and URL encode each chunk
  const chunks = chunkString(compressedBeatData)
  const encodedChunks = chunks.map((chunk) => encodeURIComponent(chunk))

  return `${window.location.origin}/import/${encodedChunks.join('/')}`
}
