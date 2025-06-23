import { generateGuid } from '@/util/generateGuid'

// Storage keys
export const BEATS_STORAGE_KEY = 'van13k-beats-library'

// Beat interface
export interface Beat {
  id: string // Unique identifier
  name: string
  grid: number[][]
  created: number
  modified: number
  authors: string[] // Array of X handles who have edited this beat
  sampleMapping?: { [hitIdx: number]: { sampleGuid: string; fallbackIdx: number } } // Custom sample mappings
}

// Beat storage functions
export const loadBeatsFromStorage = (): Beat[] => {
  try {
    const stored = localStorage.getItem(BEATS_STORAGE_KEY)
    const beats = stored ? JSON.parse(stored) : []

    // Ensure all beats have an authors array and ID (for backward compatibility)
    return beats.map((beat: any) => ({
      ...beat,
      id: beat.id || generateGuid(),
      authors: beat.authors || [],
    }))
  } catch {
    return []
  }
}

export const saveBeatsToStorage = (beats: Beat[]): void => {
  try {
    localStorage.setItem(BEATS_STORAGE_KEY, JSON.stringify(beats))
  } catch (e) {
    console.error('Failed to save beats:', e)
    throw new Error('Failed to save beats')
  }
}
