import van from 'vanjs-core'
import { Button } from './Button'
import { Modal } from './Modal'

const { div, p, h1, h2 } = van.tags

const SPLASH_DISMISSED_KEY = 'js13k-splash-dismissed'

export const SplashPage = () => {
  const isOpen = van.state(!localStorage.getItem(SPLASH_DISMISSED_KEY))

  const dismissSplash = () => {
    localStorage.setItem(SPLASH_DISMISSED_KEY, 'true')
    isOpen.val = false
  }

  // Lock body scroll when modal is open
  van.derive(() => {
    document.body.style.overflow = isOpen.val ? 'hidden' : ''
  })

  const content = () =>
    div(
      { class: 'splash-content' },
      h1({ class: 'splash-title' }, 'Beat Threads'),
      div(
        { class: 'splash-section' },
        h2('How to Play'),
        p('Create and share musical beats with others!'),
        p('• Click on the grid to create beats'),
        p('• Use the controls to adjust tempo and volume'),
        p('• Save your beats to your library'),
        p('• Share your beats with others')
      ),
      div(
        { class: 'splash-section' },
        h2('Tips'),
        p('• Try different patterns to create unique rhythms'),
        p('• Experiment with different tempos'),
        p('• Save your favorite beats for later')
      )
    )

  const helpButton = () =>
    div(
      { class: 'help-button' },
      Button({
        onClick: () => (isOpen.val = true),
        variant: 'secondary',
        children: '?',
      })
    )

  return () =>
    div(
      { class: 'splash-container' },
      Modal({
        isOpen,
        content,
        primaryButton: {
          text: 'Get Started',
          onClick: dismissSplash,
        },
      }),
      helpButton()
    )
}
