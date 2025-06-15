import { loadXHandleFromStorage, saveXHandleToStorage } from '@/storage'
import van from 'vanjs-core'
import { flash } from './statusManager'

// Global X Handle state
export const xHandle = van.state('')
export const showXHandleModal = van.state(false)
export const tempXHandle = van.state('')

/**
 * Initialize X Handle system - loads from storage and shows modal if needed
 */
export const initializeXHandle = () => {
  // Load X handle from storage
  xHandle.val = loadXHandleFromStorage()

  // Show X handle modal if not set
  if (!xHandle.val) {
    showXHandleModal.val = true
  }
}

/**
 * Save X handle and show welcome message
 */
export const saveXHandle = () => {
  xHandle.val = tempXHandle.val
  saveXHandleToStorage(tempXHandle.val)
  showXHandleModal.val = false
  if (tempXHandle.val) {
    flash(`👋 Welcome, @${tempXHandle.val}!`)
  }
}

/**
 * Skip X handle setup and show welcome message
 */
export const skipXHandle = () => {
  showXHandleModal.val = false
  flash('👋 Welcome to Beat Threads!')
}
