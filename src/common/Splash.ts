import van from 'vanjs-core'
import { Button } from './Button'
import { Modal } from './Modal'
import styles from './Splash.module.css'

const { div, p, h1, h2 } = van.tags

export interface SplashProps {
  title: string
  sections: {
    title: string
    content: string[]
  }[]
  storageKey?: string
  primaryButtonText?: string
  helpButtonText?: string
}

export const Splash = ({
  title,
  sections,
  storageKey = 'splash-dismissed',
  primaryButtonText = 'Get Started',
  helpButtonText = '?',
}: SplashProps) => {
  const isOpen = van.state(!localStorage.getItem(storageKey))

  const dismissSplash = () => {
    localStorage.setItem(storageKey, 'true')
    isOpen.val = false
  }

  // Lock body scroll when modal is open
  van.derive(() => {
    document.body.style.overflow = isOpen.val ? 'hidden' : ''
  })

  const content = () =>
    div(
      { class: styles.content },
      h1({ class: styles.title }, title),
      ...sections.map((section) =>
        div({ class: styles.section }, h2(section.title), ...section.content.map((text) => p(text)))
      )
    )

  const helpButton = () =>
    div(
      { class: styles.helpButton },
      Button({
        onClick: () => (isOpen.val = true),
        variant: 'secondary',
        children: helpButtonText,
      })
    )

  return () =>
    div(
      { class: styles.container },
      Modal({
        isOpen,
        content,
        primaryButton: {
          text: primaryButtonText,
          onClick: dismissSplash,
        },
      }),
      helpButton()
    )
}
