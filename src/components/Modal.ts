import van, { State } from 'vanjs-core'
import { Button } from './Button'

const { div } = van.tags

export interface ModalProps {
  isOpen: State<boolean>
  title: string
  content: () => any
  primaryButton?: {
    text: string
    onClick: () => void
  }
  secondaryButton?: {
    text: string
    onClick: () => void
  }
}

export const Modal =
  ({ isOpen, title, content, primaryButton, secondaryButton }: ModalProps) =>
  () =>
    isOpen.val
      ? div(
          { class: 'modal-overlay' },
          div(
            { class: 'modal' },
            div({ class: 'modal-title' }, title),
            div({ class: 'modal-content' }, content()),
            div(
              { class: 'modal-buttons' },
              primaryButton &&
                Button({ onClick: primaryButton.onClick, variant: 'primary', children: primaryButton.text }),
              secondaryButton &&
                Button({ onClick: secondaryButton.onClick, variant: 'secondary', children: secondaryButton.text })
            )
          )
        )
      : ''
