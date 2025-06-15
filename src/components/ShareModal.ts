import van, { State } from 'vanjs-core'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import { div, input } from '../common/tags'

interface ShareModalProps {
  isOpen: State<boolean>
  shareUrl: string
  onClose: () => void
  onCopyUrl: () => void
}

export const ShareModal = ({ isOpen, shareUrl, onClose, onCopyUrl }: ShareModalProps) => {
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

  // Reset copied state when modal closes
  van.derive(() => {
    if (!isOpen.val) {
      copied.val = false
      if (copyTimeout) {
        clearTimeout(copyTimeout)
      }
    }
  })

  return Modal({
    isOpen,
    title: 'Share Your Beat',
    content: () =>
      div(
        div('Share this URL to let others listen to your beat:'),
        div(
          { class: 'share-url-container' },
          input({
            class: 'share-url',
            type: 'text',
            value: shareUrl,
            readonly: true,
            onclick: (e: Event) => {
              const target = e.target as HTMLInputElement
              target.select()
            },
          }),
          Button({
            onClick: handleCopy,
            variant: copied.val ? 'primary' : 'primary',
            class: `copy-button ${copied.val ? 'copy-success' : ''}`,
            children: () => (copied.val ? '✅ Copied!' : '📋 Copy to Clipboard'),
          })
        )
      ),
    primaryButton: {
      text: 'Close',
      onClick: onClose,
    },
  })
}
