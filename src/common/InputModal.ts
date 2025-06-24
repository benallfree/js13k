import styles from '@/styles.module.css'
import van from 'vanjs-core'
import { ButtonVariant } from './Button'
import { Modal } from './Modal'
import { div, input, VanValue } from './tags'
import { classify } from './util/classify'

export interface InputModalProps {
  title: VanValue
  prompt: VanValue
  initialValue?: string
  placeholder?: string
  confirmText?: VanValue
  cancelText?: VanValue
  onConfirm?: (value: string) => void
  onCancel?: () => void
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
      onConfirm?.(inputValue.val.trim())
    }
  }

  const modal = Modal<{ initialValue: string }>({
    title,
    content: () =>
      div(
        div(prompt),
        input({
          type: 'text',
          name: 'input',
          autofocus: true,
          placeholder,
          value: () => inputValue.val,
          ...classify(styles.input),
          oninput: (e: Event) => {
            inputValue.val = (e.target as HTMLInputElement).value
          },
          onkeydown: (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              onCancel?.()
              modal.close()
            }
            if (e.key === 'Enter') {
              handleConfirm()
              modal.close()
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
        onClick: () => onCancel?.(),
        variant: ButtonVariant.Cancel,
      },
    ],
    onOpen: () => {
      inputValue.val = initialValue
    },
  })

  return modal
}
