import { ButtonVariant } from '@/common/Button'
import { classify } from '@/common/utils'
import { State } from 'vanjs-core'
import { Modal } from '../common/Modal'
import { div, input } from '../common/tags'
import globalStyles from './common.module.css'

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
          div({ ...classify(globalStyles.textGray) }, 'This will be included when you share beats (optional)'),
          div(
            { ...classify(globalStyles.mt5) },
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
      buttons: [
        {
          text: 'Save',
          onClick: () => saveXHandle(tempXHandle.val),
          variant: ButtonVariant.Primary,
        },
        {
          text: 'Skip',
          onClick: skipXHandle,
          variant: ButtonVariant.Cancel,
        },
      ],
    })()
