import van from 'vanjs-core'
import { createSampleData, mergeAuthors } from '../common/utils'
import { xHandle } from '../common/xHandleManager'
import { Sample, loadSamplesFromStorage, saveSamplesToStorage } from '../storage'

// Sample editor state
export const currentSampleName = van.state('Untitled Sample')
export const savedSamples = van.state<Sample[]>([])
export const currentSampleId = van.state<string>('')
export const originalSampleName = van.state<string>('')

// Sample editing state
export const maxSamplesForSharing = 3000 // About 375ms at 8kHz - fits in ~4KB base64 for URL sharing
export const windowSizeInSamples = van.state(maxSamplesForSharing)
export const windowPositionInSamples = van.state(0)
export const totalSampleCount = van.state(0)
export const windowedSampleData = van.state<string>('') // Base64 audio data (downsampled)
export const fullSampleData = van.state<string>('') // Base64 audio data (original quality)
export const currentSampleFallback = van.state<number>(0) // Fallback stock sample index

// Sample authors state (for shared samples)
export const sharedSampleAuthors = van.state<string[]>([])

/**
 * Get the complete authors array for the current sample
 * Combines existing sample authors, shared sample authors, and current user's handle
 */
export const getAuthorsForCurrentSample = (): string[] => {
  const samples = loadSamplesFromStorage()
  const existingSample = currentSampleId.val ? samples.find((s) => s.id === currentSampleId.val) : null
  return mergeAuthors(existingSample?.authors, sharedSampleAuthors.val, xHandle.val)
}

export const saveSample = (name: string, authors: string[]) => {
  if (!name.trim()) return false
  if (!windowedSampleData.val) return false // Must have audio data

  const samples = loadSamplesFromStorage()
  const existingSample = currentSampleId.val ? samples.find((s) => s.id === currentSampleId.val) : undefined

  const sample = createSampleData(
    {
      id: currentSampleId.val,
      name,
      audioData: windowedSampleData.val, // Use windowed version or fallback to full
      originalAudioData: fullSampleData.val,
      fallbackIdx: currentSampleFallback.val,
      authors,
      windowPosition: windowPositionInSamples.val,
      windowSize: windowSizeInSamples.val,
    },
    existingSample
  )

  const existingIndex = samples.findIndex((s) => s.id === sample.id)
  if (existingIndex !== -1) {
    samples[existingIndex] = sample
  } else {
    samples.push(sample)
  }

  saveSamplesToStorage(samples)
  savedSamples.val = [...samples]
  currentSampleName.val = name
  originalSampleName.val = name
  currentSampleId.val = sample.id
  return true
}

export const loadSample = (sample: Sample) => {
  windowedSampleData.val = sample.audioData
  fullSampleData.val = sample.originalAudioData || sample.audioData
  currentSampleFallback.val = sample.fallbackIdx
  currentSampleName.val = sample.name
  originalSampleName.val = sample.name
  currentSampleId.val = sample.id
  sharedSampleAuthors.val = sample.authors || []
}

export const newSample = () => {
  windowedSampleData.val = ''
  fullSampleData.val = ''
  currentSampleFallback.val = 0
  currentSampleName.val = 'Untitled Sample'
  originalSampleName.val = 'Untitled Sample'
  currentSampleId.val = ''
  sharedSampleAuthors.val = []
}

export const deleteSample = (sampleId: string) => {
  const samples = loadSamplesFromStorage().filter((s) => s.id !== sampleId)
  saveSamplesToStorage(samples)
  savedSamples.val = [...samples]
  if (currentSampleId.val === sampleId) {
    newSample()
  }
}

// Auto-save function when sample data changes
export const autoSave = () => {
  if (!currentSampleName.val.trim() || !windowedSampleData.val) {
    return
  }

  const authors = getAuthorsForCurrentSample()
  saveSample(currentSampleName.val, authors)
}
