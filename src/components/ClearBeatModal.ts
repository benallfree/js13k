import van, { State } from 'vanjs-core'

const { div, button, h3 } = van.tags

export const ClearBeatModal = (showClearModal: State<boolean>, onConfirm: () => void, onCancel: () => void) => () =>
  showClearModal.val
    ? div(
        { class: 'modal-overlay' },
        div(
          { class: 'modal' },
          h3('Clear Beat'),
          div('Are you sure you want to clear this beat? Any unsaved changes will be lost.'),
          div(
            { class: 'modal-buttons' },
            button({ class: 'primary', onclick: onConfirm }, 'Clear Beat'),
            button({ class: 'secondary', onclick: onCancel }, 'Cancel')
          )
        )
      )
    : ''
