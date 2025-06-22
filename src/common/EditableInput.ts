import van, { State } from 'vanjs-core'
import { div, input, span } from '../common/tags'
import globalStyles from '../components/common.module.css'
import { ButtonVariant } from './Button'
import { classify } from './classify'
import { clickify } from './clickify'
import { Modal, useModal } from './Modal'

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
  const modal = useModal()
  const tempValue = van.state('')

  const openModal = () => {
    tempValue.val = value.val
    modal.open()
  }

  const handleSave = () => {
    if (tempValue.val.trim()) {
      onSave(tempValue.val.trim())
    }
    modal.close()
  }

  const handleCancel = () => {
    modal.close()
  }

  return div(
    { ...classify(globalStyles.flex, globalStyles.itemsCenter, globalStyles.gapMedium, globalStyles.mb3, className) },
    span(
      {
        ...classify(
          globalStyles.textWhite,
          globalStyles.cursorPointer,
          globalStyles.p2,
          globalStyles.rounded,
          globalStyles.transitionBg
        ),
        ...clickify(openModal),
      },
      () => value.val,
      () => (isModified?.val ? span({ ...classify(globalStyles.textYellow) }, modifiedIndicator) : '')
    ),
    Modal({
      isOpen: modal.isOpen,
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
      buttons: [
        {
          text: saveButtonText,
          onClick: handleSave,
          variant: ButtonVariant.Primary,
        },
        {
          text: cancelButtonText,
          onClick: handleCancel,
          variant: ButtonVariant.Secondary,
        },
      ],
    })
  )
}
