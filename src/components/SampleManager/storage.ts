import { generateGuid } from '@/util/generateGuid'

export const SAMPLES_STORAGE_KEY = 'js13k-samples-library'

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
