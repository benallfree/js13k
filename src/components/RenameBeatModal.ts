import van, { State } from 'vanjs-core'
import { Modal } from '../common/Modal'

const { div, input } = van.tags

export const RenameBeatModal =
  (
    showRenameModal: State<boolean>,
    originalName: State<string>,
    newName: State<string>,
    onConfirm: () => void,
    onCancel: () => void
  ) =>
  () =>
    Modal({
      isOpen: showRenameModal,
      title: 'Rename Beat',
      content: () =>
        div(
          div('Enter a new name for your beat:'),
          input({
            type: 'text',
            value: () => newName.val,
            oninput: (e: Event) => {
              newName.val = (e.target as HTMLInputElement).value
            },
            onkeydown: (e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                onConfirm()
              }
            },
          })
        ),
      primaryButton: {
        text: 'Rename',
        onClick: onConfirm,
      },
      secondaryButton: {
        text: 'Cancel',
        onClick: onCancel,
      },
    })()
