import { State } from 'vanjs-core'
import { InputModal } from '../../common'

export const RenameBeatModal =
  (
    showRenameModal: State<boolean>,
    originalName: State<string>,
    newName: State<string>,
    onConfirm: (value: string) => void,
    onCancel: () => void
  ) =>
  () =>
    InputModal({
      isOpen: showRenameModal,
      title: 'Rename Beat',
      prompt: 'Enter a new name for your beat:',
      inputValue: newName,
      confirmText: 'Rename',
      onConfirm,
      onCancel,
    })
