import { State } from 'vanjs-core'
import { Modal } from '../common/Modal'
import { div, input } from '../common/tags'

export const XHandleModal =
  (showXHandleModal: State<boolean>, tempXHandle: State<string>, saveXHandle: () => void, skipXHandle: () => void) =>
  () =>
    Modal({
      isOpen: showXHandleModal,
      title: 'Welcome to Beat Threads! 🎵',
      content: () =>
        div(
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
          })
        ),
      primaryButton: {
        text: 'Save',
        onClick: saveXHandle,
      },
      secondaryButton: {
        text: 'Skip',
        onClick: skipXHandle,
      },
    })()
