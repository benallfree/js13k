import { State } from 'vanjs-core'
import styles from '../components/common.module.css'
import { ButtonVariant } from './Button'
import { Modal } from './Modal'
import { div, input } from './tags'

export interface InputModalProps {
  isOpen: State<boolean>
  title: string
  prompt: string
  inputValue: State<string>
  placeholder?: string
  confirmText?: string
  cancelText?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export const InputModal = ({
  isOpen,
  title,
  prompt,
  inputValue,
  placeholder = '',
  confirmText = 'Save',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: InputModalProps) => {
  const handleConfirm = () => {
    if (inputValue.val.trim()) {
      onConfirm(inputValue.val.trim())
    }
  }

  return Modal({
    isOpen,
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
}
