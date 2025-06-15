import { loadXHandleFromStorage, saveXHandleToStorage } from '@/storage'
import van from 'vanjs-core'
import { flash } from './statusManager'
import { useModal } from './utils'

// Global X Handle state
export const xHandle = van.state('')
export const xHandleModal = useModal()
export const tempXHandle = van.state('')

/**
 * Initialize X Handle system - loads from storage and shows modal if needed
 */
export const initializeXHandle = () => {
  // Load X handle from storage
  xHandle.val = loadXHandleFromStorage()

  // Show X handle modal if not set
  if (!xHandle.val) {
    xHandleModal.open()
  }
}

/**
 * Save X handle and show welcome message
 */
export const saveXHandle = () => {
  xHandle.val = tempXHandle.val
  saveXHandleToStorage(tempXHandle.val)
  xHandleModal.close()
  if (tempXHandle.val) {
    flash(`👋 Welcome, @${tempXHandle.val}!`)
  }
}

/**
 * Skip X handle setup and show welcome message
 */
export const skipXHandle = () => {
  xHandleModal.close()
  flash('👋 Welcome to Beat Threads!')
}
