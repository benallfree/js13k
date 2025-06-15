import { State } from 'vanjs-core'
import { Button, ButtonVariant } from './Button'
import styles from './Modal.module.css'
import { div } from './tags'

export interface ButtonProps {
  text: string
  onClick: () => void
  variant?: ButtonVariant
}

export interface ModalProps {
  isOpen: State<boolean>
  title?: string
  content: () => any
  buttons?: ButtonProps[]
}

export const Modal =
  ({ isOpen, title, content, buttons }: ModalProps) =>
  () =>
    isOpen.val
      ? div(
          {
            class: styles.overlay,
            onclick: (e: MouseEvent) => {
              const target = e.target as HTMLElement
              if (target.classList.contains(styles.overlay)) {
                const cancelButton = buttons?.find((button) => button.variant === ButtonVariant.Cancel)
                cancelButton?.onClick()
                isOpen.val = false
              }
            },
          },
          div(
            { class: styles.modal },
            title && div({ class: styles.title }, title),
            div({ class: styles.content }, content()),
            () =>
              buttons?.length &&
              div(
                { class: styles.buttons },
                buttons?.map((button) =>
                  Button({
                    onClick: () => {
                      button.onClick()
                      isOpen.val = false
                    },
                    variant: button.variant || ButtonVariant.Primary,
                    children: button.text,
                  })
                )
              )
          )
        )
      : ''
