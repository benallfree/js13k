import van, { State } from 'vanjs-core'

const { div, input, button, h3 } = van.tags

export const XHandleModal =
  (showXHandleModal: State<boolean>, tempXHandle: State<string>, saveXHandle: () => void, skipXHandle: () => void) =>
  () =>
    showXHandleModal.val
      ? div(
          { class: 'modal-overlay' },
          div(
            { class: 'modal' },
            h3('Welcome to Beat Maker! 🎵'),
            div("What's your X (Twitter) handle?"),
            div(
              { style: 'color: #999; font-size: 12px; margin: 10px 0;' },
              'This will be included when you share beats (optional)'
            ),
            input({
              type: 'text',
              placeholder: 'username (without @)',
              value: () => tempXHandle.val,
              oninput: (e: Event) => {
                tempXHandle.val = (e.target as HTMLInputElement).value
              },
              onkeydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  saveXHandle()
                }
              },
            }),
            div(
              { class: 'modal-buttons' },
              button({ class: 'primary', onclick: saveXHandle }, 'Save'),
              button({ class: 'secondary', onclick: skipXHandle }, 'Skip')
            )
          )
        )
      : ''
