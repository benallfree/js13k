import { Button, ButtonVariant } from '@/van13k/Button'
import { Modal } from '@/van13k/Modal'
import { div, input, VanValue } from '@/van13k/tags'
import { classify } from '@/van13k/util/classify'
import { clickify } from '@/van13k/util/clickify'
import van from 'vanjs-core'
import styles from './ShareModal.module.css'

interface ShareModalProps {
  title: VanValue
  instructions: VanValue
  onClose?: () => void
  onCopyUrl?: () => void
}

export const ShareModal = ({ title, instructions, onClose, onCopyUrl }: ShareModalProps) => {
  const copied = van.state(false)
  let copyTimeout: ReturnType<typeof setTimeout>

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareUrl.val)
      .then(() => {
        onCopyUrl?.()
      })
      .catch(() => {
        console.warn(`Failed to copy to clipboard`)
      })

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

  const shareUrl = van.state('')

  return Modal<{ shareUrl: string }>({
    title,
    content: () =>
      div(
        div(instructions),
        div(
          { class: styles.shareUrlContainer },
          input({
            class: styles.shareUrl,
            name: 'shareUrl',
            autofocus: true,
            type: 'text',
            value: () => shareUrl.val || '',
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
        variant: ButtonVariant.Cancel,
      },
    ],
    onOpen: (params?: { shareUrl: string }) => {
      shareUrl.val = params?.shareUrl || ''
    },
    onClose: () => onClose?.(),
  })
}
