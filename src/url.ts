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
  // Create a complete beat object to share
  const beatData = {
    [beat.id]: {
      name: beat.name,
      grid: beat.grid,
      authors: [...beat.authors],
      created: Date.now(),
    },
  }

  // Add current user to authors if they have an X handle and aren't already in the list
  if (xHandle && !beatData[beat.id].authors.includes(xHandle)) {
    beatData[beat.id].authors.push(xHandle)
  }

  // Encode the complete beat data as base64 JSON
  const beatJson = JSON.stringify(beatData)
  const encodedBeat = btoa(beatJson)

  return `${window.location.origin}/share/${encodedBeat}`
}
