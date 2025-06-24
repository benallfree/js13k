import { generateGuid } from '@/util/generateGuid'
import { van } from '@van13k'

import { getXHandle } from '../XHandle/xHandleManager'
import { Beat, loadBeatsFromStorage, saveBeatsToStorage } from './storage'

/**
 * Create a complete Beat object with consistent timestamp handling
 * @param partial - Partial beat data
 * @param existingBeat - Existing beat for timestamp preservation
 * @returns Complete Beat object
 */
export const createBeatData = (
  partial: Partial<Beat> & { name: string; grid: number[][] },
  existingBeat?: Beat
): Beat => {
  const now = Date.now()
  return {
    id: partial.id || generateGuid(),
    name: partial.name,
    grid: partial.grid.map((row) => [...row]), // Deep copy grid
    authors: partial.authors || [],
    created: existingBeat?.created || now,
    modified: now,
  }
}

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
  const thisAuthor = getXHandle()
  return [...new Set([thisAuthor, ...(existingBeat?.authors || [])].filter(Boolean))]
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
  sharedBeatAuthors.val = beat.authors || []
}

export const newBeat = () => {
  grid.val = Array(16)
    .fill(0)
    .map(() => Array(16).fill(0))
  currentBeatName.val = 'Untitled Beat'
  originalBeatName.val = 'Untitled Beat'
  currentBeatId.val = ''
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
