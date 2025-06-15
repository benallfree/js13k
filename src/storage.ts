// Storage keys
export const BEATS_STORAGE_KEY = 'js13k-beats-library'
export const SAMPLES_STORAGE_KEY = 'js13k-samples-library'
export const X_HANDLE_STORAGE_KEY = 'js13k-x-handle'

// Generate a shorter but still highly unique ID (used for JS13K size constraints)
export const generateGuid = () => {
  // Generate 8 random bytes and convert to base64
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-') // URL-safe
    .replace(/\//g, '_')
    .replace(/=+$/, '') // Remove padding
}

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

// Sample interface
export interface Sample {
  id: string
  name: string
  audioData: string // Base64 encoded audio data (8-bit PCM)
  originalAudioData: string // Base64 encoded original audio data (Float32) for re-editing
  fallbackIdx: number // Index of stock sample to use as fallback
  authors: string[]
  created: number
  modified: number
  windowPosition: number // Window starting position in samples
  windowSize: number // Window size in samples
}

export interface SharableSample {
  id: string
  name: string
  audioData: string // Base64 encoded audio data (8-bit PCM)
  fallbackIdx: number // Index of stock sample to use as fallback
  authors: string[]
  createdDate: string
  modifiedDate: string
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

// Sample storage functions
export const loadSamplesFromStorage = (): Sample[] => {
  try {
    const stored = localStorage.getItem(SAMPLES_STORAGE_KEY)
    const samples = stored ? JSON.parse(stored) : []

    // Ensure all samples have required fields (for backward compatibility)
    return samples.map((sample: any) => ({
      ...sample,
      id: sample.id || generateGuid(),
      authors: sample.authors || [],
    }))
  } catch {
    return []
  }
}

export const saveSamplesToStorage = (samples: Sample[]): void => {
  try {
    localStorage.setItem(SAMPLES_STORAGE_KEY, JSON.stringify(samples))
  } catch (e) {
    console.error('Failed to save samples:', e)
    throw new Error('Failed to save samples')
  }
}
