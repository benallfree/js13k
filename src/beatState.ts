import van from 'vanjs-core'
import { xHandle } from './common/xHandleManager'
import { Beat, generateGuid, loadBeatsFromStorage, saveBeatsToStorage } from './storage'

// Beat maker state
export const playing = van.state(false)
export const currentStep = van.state(0)
export const selectedInstrument = van.state(0)
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
export const isModified = van.state(false)
export const currentBeatId = van.state<string>('')
export const originalBeatName = van.state<string>('')

// Beat authors state (moved from Home.ts)
export const sharedBeatAuthors = van.state<string[]>([])

/**
 * Get the complete authors array for the current beat
 * Combines existing beat authors, shared beat authors, and current user's handle
 */
export const getAuthorsForCurrentBeat = (): string[] => {
  // Start with existing authors from the current beat
  let authors: string[] = []
  if (currentBeatId.val) {
    const beats = loadBeatsFromStorage()
    const existingBeat = beats.find((b) => b.id === currentBeatId.val)
    authors = existingBeat?.authors || []
  }

  // Merge with shared beat authors from URL (deduplicated)
  authors = [...new Set([...authors, ...sharedBeatAuthors.val])]

  // Add current user to authors if they have an X handle and aren't already in the list
  if (xHandle.val && !authors.includes(xHandle.val)) {
    authors.push(xHandle.val)
  }

  return authors
}

export const saveBeat = (name: string, authors: string[]) => {
  if (!name.trim()) return false

  const beats = loadBeatsFromStorage()
  const now = Date.now()

  const beat: Beat = {
    id: currentBeatId.val || generateGuid(),
    name: name,
    grid: grid.val.map((row) => [...row]),
    created: currentBeatId.val ? beats.find((b) => b.id === currentBeatId.val)?.created || now : now,
    modified: now,
    authors: authors,
  }

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
  isModified.val = false
  return true
}

export const loadBeat = (beat: Beat) => {
  grid.val = beat.grid.map((row) => [...row])
  currentBeatName.val = beat.name
  originalBeatName.val = beat.name
  currentBeatId.val = beat.id
  isModified.val = false
  sharedBeatAuthors.val = beat.authors || []
}

export const newBeat = () => {
  grid.val = Array(16)
    .fill(0)
    .map(() => Array(16).fill(0))
  currentBeatName.val = 'Untitled Beat'
  originalBeatName.val = 'Untitled Beat'
  currentBeatId.val = ''
  isModified.val = false
  sharedBeatAuthors.val = []
}

export const deleteBeat = (beatId: string) => {
  const beats = loadBeatsFromStorage().filter((b) => b.id !== beatId)
  saveBeatsToStorage(beats)
  savedBeats.val = [...beats]
  if (currentBeatId.val === beatId) {
    newBeat()
  }
}
