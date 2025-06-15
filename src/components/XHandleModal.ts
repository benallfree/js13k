import { State } from 'vanjs-core'
import { Modal } from '../common/Modal'
import { div, input } from '../common/tags'
import sharedStyles from './Shared.module.css'

export const XHandleModal =
  (
    showXHandleModal: State<boolean>,
    tempXHandle: State<string>,
    saveXHandle: (value: string) => void,
    skipXHandle: () => void
  ) =>
  () =>
    Modal({
      isOpen: showXHandleModal,
      title: 'Welcome to Beat Threads! 🎵',
      content: () =>
        div(
          div("What's your X (Twitter) handle?"),
          div({ class: sharedStyles.modalHelpText }, 'This will be included when you share beats (optional)'),
          div(
            { style: 'margin-top: 1rem;' },
            input({
              type: 'text',
              placeholder: 'username (without @)',
              value: () => tempXHandle.val,
              oninput: (e: Event) => {
                tempXHandle.val = (e.target as HTMLInputElement).value
              },
              onkeydown: (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                  saveXHandle(tempXHandle.val)
                }
              },
            })
          )
        ),
      primaryButton: {
        text: 'Save',
        onClick: () => saveXHandle(tempXHandle.val),
      },
      secondaryButton: {
        text: 'Skip',
        onClick: skipXHandle,
      },
    })()
