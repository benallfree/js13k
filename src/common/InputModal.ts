import styles from '@/styles.module.css'
import van from 'vanjs-core'
import { ButtonVariant } from './Button'
import { Modal } from './Modal'
import { div, input, VanValue } from './tags'

export interface InputModalProps {
  title: VanValue
  prompt: VanValue
  initialValue?: string
  placeholder?: string
  confirmText?: VanValue
  cancelText?: VanValue
  onConfirm: (value: string) => void
  onCancel: () => void
}

export const InputModal = ({
  title,
  prompt,
  initialValue = '',
  placeholder = '',
  confirmText = 'Save',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: InputModalProps) => {
  const inputValue = van.state(initialValue)

  const handleConfirm = () => {
    if (inputValue.val.trim()) {
      onConfirm(inputValue.val.trim())
    }
  }

  const modal = Modal({
    title,
    content: () =>
      div(
        div(prompt),
        input({
          type: 'text',
          placeholder,
          value: () => inputValue.val,
          className: styles.input,
          oninput: (e: Event) => {
            inputValue.val = (e.target as HTMLInputElement).value
          },
          onkeydown: (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              handleConfirm()
            }
          },
        })
      ),
    buttons: [
      {
        text: confirmText,
        onClick: handleConfirm,
        variant: ButtonVariant.Primary,
      },
      {
        text: cancelText,
        onClick: onCancel,
        variant: ButtonVariant.Cancel,
      },
    ],
  })

  return {
    ...modal,
    open: (initialValue: string) => {
      inputValue.val = initialValue
      modal.open()
    },
  }
}
