import van, { State } from 'vanjs-core'

const { div, button } = van.tags

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
              primaryButton && button({ class: 'primary', onclick: primaryButton.onClick }, primaryButton.text),
              secondaryButton && button({ class: 'secondary', onclick: secondaryButton.onClick }, secondaryButton.text)
            )
          )
        )
      : ''
