import { ButtonVariant, classify, div, generateGuid, input, Modal, van, VanValue } from '@van13k'
import { input as inputStyle } from '../styles.module.css'

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

  const inputId = `input-${generateGuid()}`

  const modal = Modal<{ initialValue: string }>({
    title,
    content: () =>
      div(
        div(prompt),
        input({
          type: 'text',
          id: inputId,
          name: 'input',
          autofocus: true,
          placeholder,
          value: () => inputValue.val,
          ...classify(inputStyle),
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
      setTimeout(() => {
        const inputElement = document.getElementById(inputId) as HTMLInputElement
        if (inputElement) {
          inputElement.focus()
          inputElement.select()
        }
      }, 10)
    },
  })

  return modal
}
