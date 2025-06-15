import { State } from 'vanjs-core'
import { Modal } from './Modal'
import { div } from './tags'

export interface ConfirmationModalProps {
  isOpen: State<boolean>
  title: string
  message: string | (() => string)
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  return Modal({
    isOpen,
    title,
    content: () => div(typeof message === 'function' ? message() : message),
    primaryButton: {
      text: confirmText,
      onClick: onConfirm,
      variant: confirmVariant,
    },
    secondaryButton: {
      text: cancelText,
      onClick: onCancel,
    },
  })
}
