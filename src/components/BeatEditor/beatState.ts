import { createBeatData, mergeAuthors } from '@/common/utils'
import { xHandle } from '@/components/XHandle/xHandleManager'
import van from 'vanjs-core'
import { Beat, loadBeatsFromStorage, saveBeatsToStorage } from './storage'

// Beat maker state
export const playing = van.state(false)
export const currentStep = van.state(0)
export const selectedInstrument = van.state(0)
export const selectedSampleId = van.state('')
export const currentSampleMapping = van.state<{ [hitIdx: number]: { sampleGuid: string; fallbackIdx: number } }>({})
export const grid = van.state<number[][]>(
  Array(16)
    .fill(0)
    .map(() => Array(16).fill(0))
)
export const playingCells = van.state<Set<string>>(new Set())
export const stepHistory = van.state<number[]>([])

// Beat library state
export const currentBeatName = van.state('Untitled Beat')
export const savedBeats = van.state<Beat[]>([])
export const showLibrary = van.state(false)
export const currentBeatId = van.state<string>('')
export const originalBeatName = van.state<string>('')

// Beat authors state (moved from Home.ts)
export const sharedBeatAuthors = van.state<string[]>([])

/**
 * Get the complete authors array for the current beat
 * Combines existing beat authors, shared beat authors, and current user's handle
 */
export const getAuthorsForCurrentBeat = (): string[] => {
  const beats = loadBeatsFromStorage()
  const existingBeat = currentBeatId.val ? beats.find((b) => b.id === currentBeatId.val) : null
  return mergeAuthors(existingBeat?.authors, sharedBeatAuthors.val, xHandle.val)
}

export const saveBeat = (name: string, authors: string[]) => {
  if (!name.trim()) return false

  const beats = loadBeatsFromStorage()
  const existingBeat = currentBeatId.val ? beats.find((b) => b.id === currentBeatId.val) : undefined

  const beat = createBeatData(
    {
      id: currentBeatId.val,
      name,
      grid: grid.val,
      authors,
      sampleMapping: Object.keys(currentSampleMapping.val).length > 0 ? currentSampleMapping.val : undefined,
    },
    existingBeat
  )

  const existingIndex = beats.findIndex((b) => b.id === beat.id)
  if (existingIndex !== -1) {
    beats[existingIndex] = beat
  } else {
    beats.push(beat)
  }

  saveBeatsToStorage(beats)
  savedBeats.val = [...beats]
  currentBeatName.val = name
  originalBeatName.val = name
  currentBeatId.val = beat.id
  return true
}

export const loadBeat = (beat: Beat) => {
  grid.val = beat.grid.map((row) => [...row])
  currentBeatName.val = beat.name
  originalBeatName.val = beat.name
  currentBeatId.val = beat.id
  currentSampleMapping.val = beat.sampleMapping || {}
  sharedBeatAuthors.val = beat.authors || []
  selectedSampleId.val = '' // Reset selection when loading a beat
}

export const newBeat = () => {
  grid.val = Array(16)
    .fill(0)
    .map(() => Array(16).fill(0))
  currentBeatName.val = 'Untitled Beat'
  originalBeatName.val = 'Untitled Beat'
  currentBeatId.val = ''
  currentSampleMapping.val = {}
  sharedBeatAuthors.val = []
  selectedSampleId.val = ''
}

export const deleteBeat = (beatId: string) => {
  const beats = loadBeatsFromStorage().filter((b) => b.id !== beatId)
  saveBeatsToStorage(beats)
  savedBeats.val = [...beats]
  if (currentBeatId.val === beatId) {
    newBeat()
  }
}

/**
 * Update the sample mapping for the currently selected instrument
 * This is called when a custom sample is selected for an instrument
 */
export const updateSampleMapping = (instrumentIndex: number, sampleId: string, fallbackIdx: number) => {
  const newMapping = { ...currentSampleMapping.val }
  if (sampleId) {
    newMapping[instrumentIndex] = { sampleGuid: sampleId, fallbackIdx }
  } else {
    delete newMapping[instrumentIndex]
  }
  currentSampleMapping.val = newMapping
}
