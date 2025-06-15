import van, { State } from 'vanjs-core'
import { Beat, Sample, generateGuid } from '../storage'

/**
 * Format a timestamp into a human-readable date string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Merge and deduplicate author arrays with optional current user addition
 * @param existingAuthors - Current beat authors
 * @param sharedAuthors - Authors from shared beat
 * @param currentUser - Current user handle to optionally add
 * @returns Merged and deduplicated author array
 */
export const mergeAuthors = (
  existingAuthors: string[] = [],
  sharedAuthors: string[] = [],
  currentUser?: string
): string[] => {
  let authors = [...new Set([...existingAuthors, ...sharedAuthors])]
  if (currentUser && !authors.includes(currentUser)) {
    authors.push(currentUser)
  }
  return authors
}

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

/**
 * Create a complete Sample object with consistent timestamp handling
 * @param data - Sample data
 * @param existingSample - Existing sample for timestamp preservation
 * @returns Complete Sample object
 */
export const createSampleData = (
  data: {
    id?: string
    name: string
    audioData: string
    originalAudioData?: string
    fallbackIdx: number
    duration: number
    authors: string[]
    windowPosition?: number
    windowSize?: number
  },
  existingSample?: Sample
): Sample => {
  const now = new Date()
  const newSample: Sample = {
    id: data.id || generateGuid(),
    name: data.name,
    audioData: data.audioData,
    originalAudioData: data.originalAudioData,
    fallbackIdx: data.fallbackIdx,
    duration: data.duration,
    authors: data.authors,
    createdDate: existingSample ? existingSample.createdDate : now.toISOString(),
    modifiedDate: now.toISOString(),
    windowPosition: data.windowPosition,
    windowSize: data.windowSize,
  }

  return newSample
}

/**
 * Modal state management utility
 * Provides consistent modal state and operations across the application
 */
export interface ModalManager {
  isOpen: State<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}

/**
 * Creates a modal state manager with consistent operations
 * @param initialState - Initial modal state (default: false)
 * @returns ModalManager object with state and operations
 */
export const useModal = (initialState: boolean = false): ModalManager => {
  const isOpen = van.state(initialState)

  const open = () => {
    isOpen.val = true
  }

  const close = () => {
    isOpen.val = false
  }

  const toggle = () => {
    isOpen.val = !isOpen.val
  }

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}
