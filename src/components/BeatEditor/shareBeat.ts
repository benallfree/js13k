import { chunkString, mergeAuthors } from '@/common/utils'
import { Beat } from '@/components/BeatEditor/storage'
import { compressToBase64 } from '@/util/compress'

export const shareBeat = async (beat: Beat, xHandle: string) => {
  // Create a complete beat object to share with merged authors
  const beatData = {
    [beat.id]: {
      name: beat.name,
      grid: beat.grid,
      authors: mergeAuthors(beat.authors, [], xHandle),
      created: Date.now(),
      // Include sample mapping if present
      ...(beat.sampleMapping && { sampleMapping: beat.sampleMapping }),
    },
  }

  const compressedBeatData = await compressToBase64(beatData)
  console.log(`Compression: ${btoa(JSON.stringify(beatData)).length}->${compressedBeatData.length}`)
  // Split into chunks and URL encode each chunk
  const chunks = chunkString(compressedBeatData)
  const encodedChunks = chunks.map((chunk) => encodeURIComponent(chunk))

  return `${window.location.origin}/import/${encodedChunks.join('/')}`
}
