import { clickify } from '@/common/clickify'
import { classify } from '@/common/utils'
import van from 'vanjs-core'
import { Button, ButtonVariant } from '../common/Button'
import { Modal } from '../common/Modal'
import { div, input } from '../common/tags'
import styles from './ShareModal.module.css'

interface ShareModalProps {
  title: string
  instructions: string
  shareUrl: string
  onClose: () => void
  onCopyUrl: () => void
}

export const ShareModal = ({ title, instructions, shareUrl, onClose, onCopyUrl }: ShareModalProps) => {
  const copied = van.state(false)
  let copyTimeout: ReturnType<typeof setTimeout>

  const handleCopy = () => {
    onCopyUrl()
    copied.val = true

    // Reset the copied state after 2 seconds
    if (copyTimeout) {
      clearTimeout(copyTimeout)
    }
    copyTimeout = setTimeout(() => {
      copied.val = false
    }, 2000)
  }

  const handleInputInteraction = (e: Event) => {
    const target = e.target as HTMLInputElement
    target.select()
  }

  return Modal({
    title,
    content: () =>
      div(
        div(instructions),
        div(
          { class: styles.shareUrlContainer },
          input({
            class: styles.shareUrl,
            type: 'text',
            value: shareUrl,
            readonly: true,
            ...clickify(handleInputInteraction),
          }),
          Button({
            onClick: handleCopy,
            variant: copied.val ? ButtonVariant.Primary : ButtonVariant.Primary,
            ...classify(styles.copyButton, copied.val ? styles.copySuccess : ''),
            children: () => (copied.val ? '✅ Copied!' : '📋 Copy to Clipboard'),
          })
        )
      ),
    buttons: [
      {
        text: 'Close',
        onClick: onClose,
        variant: ButtonVariant.Cancel,
      },
    ],
  })
}
