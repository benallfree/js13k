import { EditableInput } from '@/common/EditableInput'
import { State } from 'vanjs-core'

export const BeatNameInput = (
  currentBeatName: State<string>,
  isModified: State<boolean>,
  onSave: (newName: string) => void
) =>
  EditableInput({
    value: currentBeatName,
    isModified,
    onSave,
    modalTitle: 'Rename Beat',
    modalPrompt: 'Enter a new name for your beat:',
    saveButtonText: 'Rename',
    cancelButtonText: 'Cancel',
  })
