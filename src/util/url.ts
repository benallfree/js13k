import { chunkString, mergeAuthors } from '../common/utils'
import { encodeGrid } from '../components/BeatEditor/grid-utils'
import { Beat, Sample } from '../storage'

// URL state management
export const updateUrl = (grid: number[][]) => {
  const encoded = encodeGrid(grid)
  if (encoded !== '0'.repeat(256)) {
    window.location.hash = encoded
  } else {
    window.location.hash = ''
  }
}

export const shareBeat = (beat: Beat, xHandle: string) => {
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

  // Encode the complete beat data as base64 JSON
  const beatJson = JSON.stringify(beatData)
  const encodedBeat = btoa(beatJson)

  // Split into chunks and URL encode each chunk
  const chunks = chunkString(encodedBeat)
  const encodedChunks = chunks.map((chunk) => encodeURIComponent(chunk))

  return `${window.location.origin}/import/${encodedChunks.join('/')}`
}

export const shareSample = (sample: Sample, xHandle: string) => {
  // Create a complete sample object to share with merged authors
  const sampleData = {
    [sample.id]: {
      name: sample.name,
      audioData: sample.audioData,
      fallbackIdx: sample.fallbackIdx,
      authors: mergeAuthors(sample.authors, [], xHandle),
      created: Date.now(),
    },
  }

  // Encode the complete sample data as base64 JSON
  const sampleJson = JSON.stringify(sampleData)
  const encodedSample = btoa(sampleJson)

  // Split into chunks and URL encode each chunk
  const chunks = chunkString(encodedSample)
  const encodedChunks = chunks.map((chunk) => encodeURIComponent(chunk))

  return `${window.location.origin}/import/${encodedChunks.join('/')}`
}
