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
    sampleMapping: partial.sampleMapping || existingBeat?.sampleMapping,
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
    authors: string[]
    windowSize: number
    windowPosition: number
  },
  existingSample?: Sample
): Sample => {
  const now = new Date()
  const newSample: Sample = {
    id: data.id || generateGuid(),
    name: data.name,
    audioData: data.audioData,
    originalAudioData: data.originalAudioData || data.audioData,
    fallbackIdx: data.fallbackIdx,
    authors: data.authors,
    created: existingSample ? existingSample.created : now.getTime(),
    modified: now.getTime(),
    windowSize: data.windowSize,
    windowPosition: data.windowPosition,
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

/**
 * Split a string into chunks of specified size
 * @param str - String to split
 * @param chunkSize - Size of each chunk
 * @returns Array of chunks
 */
export const chunkString = (str: string, chunkSize: number = 100): string[] => {
  const chunks: string[] = []
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * Join chunks back into a single string
 * @param chunks - Array of chunks to join
 * @returns Joined string
 */
export const joinChunks = (chunks: string[]): string => {
  return chunks.join('')
}

export type VanJsClass = string | (() => string)

export const classify = (...args: VanJsClass[]) => {
  return { class: () => args.map((arg) => (typeof arg === 'string' ? arg : arg())).join(' ') }
}
