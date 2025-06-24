import { encodeGrid } from '@/components/BeatEditor/grid-utils'

// URL state management
export const updateUrl = (grid: number[][]) => {
  const encoded = encodeGrid(grid)
  if (encoded !== '0'.repeat(256)) {
    window.location.hash = encoded
  } else {
    window.location.hash = ''
  }
}
