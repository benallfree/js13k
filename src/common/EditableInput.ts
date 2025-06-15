import van, { State } from 'vanjs-core'
import { div, input, span } from '../common/tags'
import styles from './EditableInput.module.css'
import { Modal } from './Modal'

export interface EditableInputProps {
  value: State<string>
  isModified?: State<boolean>
  modifiedIndicator?: string
  onSave: (newValue: string) => void
  className?: string
  modalTitle?: string
  modalPrompt?: string
  saveButtonText?: string
  cancelButtonText?: string
}

export const EditableInput = ({
  value,
  isModified,
  modifiedIndicator = ' *',
  onSave,
  className = '',
  modalTitle = 'Edit Value',
  modalPrompt = 'Enter a new value:',
  saveButtonText = 'Save',
  cancelButtonText = 'Cancel',
}: EditableInputProps) => {
  const showModal = van.state(false)
  const tempValue = van.state('')

  const openModal = () => {
    tempValue.val = value.val
    showModal.val = true
  }

  const handleSave = () => {
    if (tempValue.val.trim()) {
      onSave(tempValue.val.trim())
    }
    showModal.val = false
  }

  const handleCancel = () => {
    showModal.val = false
  }

  return div(
    { class: `${styles.container} ${className}` },
    span(
      {
        class: styles.text,
        onclick: openModal,
      },
      () => value.val,
      () => (isModified?.val ? span({ class: styles.modified }, modifiedIndicator) : '')
    ),
    Modal({
      isOpen: showModal,
      title: modalTitle,
      content: () =>
        div(
          div(modalPrompt),
          input({
            type: 'text',
            value: () => tempValue.val,
            oninput: (e: Event) => {
              tempValue.val = (e.target as HTMLInputElement).value
            },
            onkeydown: (e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                handleSave()
              }
            },
          })
        ),
      primaryButton: {
        text: saveButtonText,
        onClick: handleSave,
      },
      secondaryButton: {
        text: cancelButtonText,
        onClick: handleCancel,
      },
    })
  )
}
