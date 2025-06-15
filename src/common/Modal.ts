import { State } from 'vanjs-core'
import { Button } from './Button'
import styles from './Modal.module.css'
import { div } from './tags'

export interface ModalProps {
  isOpen: State<boolean>
  title?: string
  content: () => any
  primaryButton?: {
    text: string
    onClick: () => void
    variant?: 'primary' | 'danger' | 'secondary'
  }
  secondaryButton?: {
    text: string
    onClick: () => void
    variant?: 'primary' | 'danger' | 'secondary'
  }
}

export const Modal =
  ({ isOpen, title, content, primaryButton, secondaryButton }: ModalProps) =>
  () =>
    isOpen.val
      ? div(
          { class: styles.overlay },
          div(
            { class: styles.modal },
            title && div({ class: styles.title }, title),
            div({ class: styles.content }, content()),
            div(
              { class: styles.buttons },
              primaryButton &&
                Button({
                  onClick: () => {
                    primaryButton.onClick()
                    isOpen.val = false
                  },
                  variant: primaryButton.variant || 'primary',
                  children: primaryButton.text,
                }),
              secondaryButton &&
                Button({
                  onClick: () => {
                    secondaryButton.onClick()
                    isOpen.val = false
                  },
                  variant: secondaryButton.variant || 'secondary',
                  children: secondaryButton.text,
                })
            )
          )
        )
      : ''
