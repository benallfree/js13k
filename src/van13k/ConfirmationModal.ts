import { ButtonVariant } from './Button'
import { Modal } from './Modal'
import { div } from './tags'

export interface ConfirmationModalProps {
  title: string
  message: string | (() => string)
  confirmText?: string
  cancelText?: string
  confirmVariant?: ButtonVariant
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmationModal = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = ButtonVariant.Primary,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  return Modal({
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
