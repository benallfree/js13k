import globalStyles from '@styles'
import { classify, div } from '@van13k'
import van from 'vanjs-core'
import { base, visible } from './StatusBar.module.css'

// Global status state
const statusMessage = van.state('')
const statusVisible = van.state(false)

let statusTimeoutId: ReturnType<typeof setTimeout>

/**
 * Flash a status message globally
 * @param message - The message to display
 * @param duration - How long to show the message in milliseconds (default: 2000)
 */
export const flash = (message: string, duration = 4000) => {
  if (statusTimeoutId) {
    clearTimeout(statusTimeoutId)
  }

  statusMessage.val = message
  statusVisible.val = true

  statusTimeoutId = setTimeout(() => {
    statusVisible.val = false
  }, duration)
}

export const StatusBar = () =>
  div(
    {
      ...classify(
        base,
        globalStyles.fixed,
        globalStyles.left0,
        globalStyles.right0,
        globalStyles.bgAccent,
        globalStyles.textAccentDark,
        globalStyles.px6,
        globalStyles.py3,
        globalStyles.textSm,
        globalStyles.zIndexMax,
        globalStyles.backdropBlur,
        globalStyles.textCenter,
        globalStyles.minH20,
        globalStyles.transitionSlow,
        globalStyles.shadowMedium,
        () => (statusVisible.val ? visible : '')
      ),
    },
    () => statusMessage.val
  )
