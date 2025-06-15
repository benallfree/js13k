import van from 'vanjs-core'

// Global status state
export const statusMessage = van.state('')
export const statusVisible = van.state(false)

let statusTimeoutId: ReturnType<typeof setTimeout>

/**
 * Flash a status message globally
 * @param message - The message to display
 * @param duration - How long to show the message in milliseconds (default: 2000)
 */
export const flash = (message: string, duration = 2000) => {
  if (statusTimeoutId) {
    clearTimeout(statusTimeoutId)
  }

  statusMessage.val = message
  statusVisible.val = true

  statusTimeoutId = setTimeout(() => {
    statusVisible.val = false
  }, duration)
}
