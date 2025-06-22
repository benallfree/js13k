import { State } from 'vanjs-core'
import { ButtonVariant } from './Button'
import { Modal } from './Modal'
import { div } from './tags'

export interface ConfirmationModalProps {
  isOpen: State<boolean>
  title: string
  message: string | (() => string)
  confirmText?: string
  cancelText?: string
  confirmVariant?: ButtonVariant
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = ButtonVariant.Primary,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  return Modal({
    isOpen,
    title,
    content: () => div(typeof message === 'function' ? message() : message),
    buttons: [
      {
        text: confirmText,
        onClick: onConfirm,
        variant: confirmVariant,
      },
      {
        text: cancelText,
        onClick: onCancel,
        variant: ButtonVariant.Cancel,
      },
    ],
  })
}
