import { Button, ButtonVariant, classify, clickify, div, input, Modal, van, VanValue } from '@van13k'

import { copyButton, copySuccess, shareUrlContainer } from './ShareModal.module.css'

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
          { class: shareUrlContainer },
          input({
            class: shareUrl,
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
            ...classify(copyButton, copied.val ? copySuccess : ''),
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
