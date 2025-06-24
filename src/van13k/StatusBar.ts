import { classify, div, van } from '@van13k'
import {
  backdropBlur,
  bgAccent,
  fixed,
  left0,
  minH20,
  px6,
  py3,
  right0,
  shadowMedium,
  textAccentDark,
  textCenter,
  textSm,
  transitionSlow,
  zIndexMax,
} from '../styles.module.css'

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
        fixed,
        left0,
        right0,
        bgAccent,
        textAccentDark,
        px6,
        py3,
        textSm,
        zIndexMax,
        backdropBlur,
        textCenter,
        minH20,
        transitionSlow,
        shadowMedium,
        () => (statusVisible.val ? visible : '')
      ),
    },
    () => statusMessage.val
  )
