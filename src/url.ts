import { decodeGrid, encodeGrid } from './grid'
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

export const loadFromUrl = (
  onLoad: (grid: number[][], name: string, authors: string[], id?: string) => void,
  showStatus: (message: string) => void
) => {
  const urlParams = new URLSearchParams(window.location.search)
  const hash = window.location.hash.slice(1)
  const beatParam = urlParams.get('beat')

  if (beatParam) {
    try {
      console.log('Attempting to load beat from URL parameter:', beatParam)
      // Try to decode as base64 JSON (new format)
      const beatJson = atob(beatParam)
      console.log('Decoded base64:', beatJson)
      const beatData = JSON.parse(beatJson)
      console.log('Parsed beat data:', beatData)

      // Get the first (and only) key which is the GUID
      const guid = Object.keys(beatData)[0]
      const beat = beatData[guid]

      if (beat.grid && Array.isArray(beat.grid)) {
        // New format with complete beat data
        onLoad(beat.grid, beat.name || 'Shared Beat', beat.authors || [], guid)

        const authorsText =
          beat.authors && beat.authors.length > 0
            ? ` by ${beat.authors.map((a: string) => `@${a}`).join(', ')}`
            : ''
        showStatus(`🔗 Shared beat loaded${authorsText}`)
        return
      }
    } catch (e) {
      console.error('Error loading beat from URL:', e)
      // If base64 decode fails, try old grid format
      const gridData = decodeGrid(beatParam)
      if (gridData) {
        onLoad(gridData, 'Shared Beat', [], undefined)
        showStatus('🔗 Shared beat loaded')
        return
      }
    }
  }

  // Check for old URL format with separate author parameter
  const authorParam = urlParams.get('author')
  if (beatParam && authorParam) {
    const gridData = decodeGrid(beatParam)
    if (gridData) {
      onLoad(gridData, `Shared Beat by @${authorParam}`, [authorParam], undefined)
      showStatus(`🔗 Shared beat loaded by @${authorParam}`)
      return
    }
  }

  // Fallback to old hash format
  if (hash) {
    const gridData = decodeGrid(hash)
    if (gridData) {
      onLoad(gridData, 'Shared Beat', [], undefined)
      showStatus('🔗 Shared beat loaded')
    }
  }
}

export const shareBeat = (beat: Beat, xHandle: string) => {
  // Create a complete beat object to share
  const beatData = {
    [beat.id]: {
      name: beat.name,
      grid: beat.grid,
      authors: [...beat.authors],
      created: Date.now()
    }
  }

  // Add current user to authors if they have an X handle and aren't already in the list
  if (xHandle && !beatData[beat.id].authors.includes(xHandle)) {
    beatData[beat.id].authors.push(xHandle)
  }

  // Encode the complete beat data as base64 JSON
  const beatJson = JSON.stringify(beatData)
  const encodedBeat = btoa(beatJson)

  return `${window.location.origin}${window.location.pathname}?beat=${encodedBeat}`
}
