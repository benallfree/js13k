import { InputModal } from '@/common'

export const RenameBeatModal = (onConfirm: (value: string) => void, onCancel: () => void) => () => {
  const modal = InputModal({
    title: 'Rename Beat',
    prompt: 'Enter a new name for your beat:',
    confirmText: 'Rename',
    onConfirm,
    onCancel,
  })
  return {
    ...modal,
    open(initialValue: string) {
      modal.open(initialValue)
    },
  }
}
