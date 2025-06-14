import van, { State } from 'vanjs-core'

const { div, input, button, h3 } = van.tags

export const RenameBeatModal =
  (
    showRenameModal: State<boolean>,
    originalName: State<string>,
    newName: State<string>,
    onConfirm: () => void,
    onCancel: () => void
  ) =>
  () =>
    showRenameModal.val
      ? div(
          { class: 'modal-overlay' },
          div(
            { class: 'modal' },
            h3('Rename Beat'),
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
            }),
            div(
              { class: 'modal-buttons' },
              button({ class: 'primary', onclick: onConfirm }, 'Rename'),
              button({ class: 'secondary', onclick: onCancel }, 'Cancel')
            )
          )
        )
      : ''
