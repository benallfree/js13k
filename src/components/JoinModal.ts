import { InputModal } from '@van13k'

export const JoinModal = () => {
  const joinModal = InputModal({
    title: 'Join Game',
    prompt: 'Enter Join Code',
    onConfirm: (code: string) => {
      console.log('Joining with code:', code)
      joinModal.close()
    },
    confirmText: 'Join',
    cancelText: 'Cancel',
  })
  return joinModal
}
