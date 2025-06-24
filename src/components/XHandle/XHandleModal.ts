import { ButtonVariant } from '@/common/Button'
import { Modal } from '@/common/Modal'
import { div, input } from '@/common/tags'
import { classify } from '@/common/utils'
import globalStyles from '@/styles.module.css'
import van from 'vanjs-core'

export const X_HANDLE_STORAGE_KEY = 'js13k-x-handle'

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

export type XHandleModalProps = {
  saveXHandle: (value: string) => void
  skipXHandle: () => void
}

export const XHandleModal = ({ saveXHandle, skipXHandle }: XHandleModalProps) => {
  const tempXHandle = van.state('')
  const modal = Modal<{ currentXHandle: string }>({
    title: 'Welcome to Beat Threads! 🎵',
    content: () =>
      div(
        div("What's your X (Twitter) handle?"),
        div({ ...classify(globalStyles.textGray) }, 'This will be included when you share beats (optional)'),
        div(
          { ...classify(globalStyles.mt5) },
          input({
            type: 'text',
            placeholder: 'username (without @)',
            value: () => tempXHandle.val,
            oninput: (e: Event) => {
              tempXHandle.val = (e.target as HTMLInputElement).value
            },
            onkeydown: (e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                saveXHandle(tempXHandle.val)
              }
            },
          })
        )
      ),
    buttons: [
      {
        text: 'Save',
        onClick: () => saveXHandle(tempXHandle.val),
        variant: ButtonVariant.Primary,
      },
      {
        text: 'Skip',
        onClick: skipXHandle,
        variant: ButtonVariant.Cancel,
      },
    ],
    onOpen: (params) => {
      tempXHandle.val = params?.currentXHandle || ''
    },
  })
  return modal
}
