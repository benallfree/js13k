import van, { State } from 'vanjs-core'

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
