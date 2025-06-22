import { ButtonVariant } from '@/common/Button'
import { State } from 'vanjs-core'
import { Modal } from '../../common/Modal'
import { div } from '../../common/tags'

export const ClearBeatModal = (showClearModal: State<boolean>, onConfirm: () => void, onCancel: () => void) => () =>
  Modal({
    isOpen: showClearModal,
    title: 'Clear Beat',
    content: () => div('Are you sure you want to clear this beat? This cannot be undone.'),
    buttons: [
      {
        text: 'Clear',
        onClick: onConfirm,
        variant: ButtonVariant.Primary,
      },
      {
        text: 'Cancel',
        onClick: onCancel,
        variant: ButtonVariant.Cancel,
      },
    ],
  })()
