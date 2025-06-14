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
  onLoad: (grid: number[][], name: string, authors: string[]) => void,
  showStatus: (message: string) => void
) => {
  const urlParams = new URLSearchParams(window.location.search)
  const hash = window.location.hash.slice(1)
  const beatParam = urlParams.get('beat')

  if (beatParam) {
    try {
      // Try to decode as base64 JSON (new format)
      const beatJson = atob(beatParam)
      const beatData = JSON.parse(beatJson)

      if (beatData.grid && Array.isArray(beatData.grid)) {
        // New format with complete beat data
        onLoad(beatData.grid, beatData.name || 'Shared Beat', beatData.authors || [])

        const authorsText =
          beatData.authors && beatData.authors.length > 0
            ? ` by ${beatData.authors.map((a: string) => `@${a}`).join(', ')}`
            : ''
        showStatus(`🔗 Shared beat loaded${authorsText}`)
        return
      }
    } catch (e) {
      // If base64 decode fails, try old grid format
      const gridData = decodeGrid(beatParam)
      if (gridData) {
        onLoad(gridData, 'Shared Beat', [])
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
      onLoad(gridData, `Shared Beat by @${authorParam}`, [authorParam])
      showStatus(`🔗 Shared beat loaded by @${authorParam}`)
      return
    }
  }

  // Fallback to old hash format
  if (hash) {
    const gridData = decodeGrid(hash)
    if (gridData) {
      onLoad(gridData, 'Shared Beat', [])
      showStatus('🔗 Shared beat loaded')
    }
  }
}

export const shareBeat = (beat: Beat, xHandle: string) => {
  // Create a complete beat object to share
  const beatData = {
    name: beat.name,
    grid: beat.grid,
    authors: [...beat.authors],
    created: Date.now()
  }

  // Add current user to authors if they have an X handle and aren't already in the list
  if (xHandle && !beatData.authors.includes(xHandle)) {
    beatData.authors.push(xHandle)
  }

  // Encode the complete beat data as base64 JSON
  const beatJson = JSON.stringify(beatData)
  const encodedBeat = btoa(beatJson)

  return `${window.location.origin}${window.location.pathname}?beat=${encodedBeat}`
}
