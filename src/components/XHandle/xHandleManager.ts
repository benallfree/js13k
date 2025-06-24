import { flash } from '@/common/StatusBar'
import van from 'vanjs-core'

export const X_HANDLE_STORAGE_KEY = 'van13k-x-handle'

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

// Global X Handle state
const xHandle = van.state('')
const tempXHandle = van.state('')

export const getXHandle = () => xHandle.val

/**
 * Initialize X Handle system - loads from storage and shows modal if needed
 */
export const initializeXHandle = () => {
  // Load X handle from storage
  xHandle.val = loadXHandleFromStorage()
}

/**
 * Save X handle and show welcome message
 */
export const saveXHandle = (value?: string) => {
  const handleValue = value || tempXHandle.val
  xHandle.val = handleValue
  saveXHandleToStorage(handleValue)
  if (handleValue) {
    flash(`👋 Welcome, @${handleValue}!`)
  }
}

/**
 * Skip X handle setup and show welcome message
 */
export const skipXHandle = () => {
  flash('👋 Welcome to Beat Threads!')
}
