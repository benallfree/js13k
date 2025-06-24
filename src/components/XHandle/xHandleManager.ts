import { flash } from '@/common/StatusBar'
import { useModal } from '@/common/utils'
import van from 'vanjs-core'
import { loadXHandleFromStorage, saveXHandleToStorage } from './XHandleModal'

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
export const saveXHandle = (value?: string) => {
  const handleValue = value || tempXHandle.val
  xHandle.val = handleValue
  saveXHandleToStorage(handleValue)
  xHandleModal.close()
  if (handleValue) {
    flash(`👋 Welcome, @${handleValue}!`)
  }
}

/**
 * Skip X handle setup and show welcome message
 */
export const skipXHandle = () => {
  xHandleModal.close()
  flash('👋 Welcome to Beat Threads!')
}
