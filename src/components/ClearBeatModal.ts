import { State } from 'vanjs-core'
import { Modal } from '../common/Modal'
import { div } from '../common/tags'

export const ClearBeatModal = (showClearModal: State<boolean>, onConfirm: () => void, onCancel: () => void) => () =>
  Modal({
    isOpen: showClearModal,
    title: 'Clear Beat',
    content: () => div('Are you sure you want to clear this beat? This cannot be undone.'),
    primaryButton: {
      text: 'Clear',
      onClick: onConfirm,
    },
    secondaryButton: {
      text: 'Cancel',
      onClick: onCancel,
    },
  })()
