import { mergeAuthors } from './common/utils'
import { encodeGrid } from './grid'
import { Beat } from './storage'

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
    },
  }

  // Encode the complete beat data as base64 JSON
  const beatJson = JSON.stringify(beatData)
  const encodedBeat = btoa(beatJson)

  return `${window.location.origin}/share/${encodedBeat}`
}
