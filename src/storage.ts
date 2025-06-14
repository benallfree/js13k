// Storage keys
export const BEATS_STORAGE_KEY = 'js13k-beats-library'
export const X_HANDLE_STORAGE_KEY = 'js13k-x-handle'

// Beat interface
export interface Beat {
  name: string
  grid: number[][]
  created: number
  modified: number
  authors: string[] // Array of X handles who have edited this beat
}

// Beat storage functions
export const loadBeatsFromStorage = (): Beat[] => {
  try {
    const stored = localStorage.getItem(BEATS_STORAGE_KEY)
    const beats = stored ? JSON.parse(stored) : []

    // Ensure all beats have an authors array (for backward compatibility)
    return beats.map((beat: any) => ({
      ...beat,
      authors: beat.authors || []
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

// X Handle storage functions
export const loadXHandleFromStorage = (): string => {
  try {
    return localStorage.getItem(X_HANDLE_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export const saveXHandleToStorage = (handle: string): void => {
  try {
    localStorage.setItem(X_HANDLE_STORAGE_KEY, handle)
  } catch (e) {
    console.error('Failed to save X handle:', e)
    throw new Error('Failed to save X handle')
  }
}
