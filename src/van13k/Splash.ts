import { Button, ButtonVariant, Modal, classify, div, h1, h2, p, van } from '@van13k'
import {
  fixed,
  maxW600,
  mb5,
  mb7,
  mxAuto,
  my5,
  p5,
  pointerAuto,
  right0,
  text3xl,
  textCcc,
  textCenter,
  textLeft,
  textPrimary,
  top0,
  zIndexHigh,
} from '../styles.module.css'

import { content } from './Splash.module.css'

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
    SplashModal.close()
  }

  const HelpButton = () =>
    div(
      {
        ...classify(fixed, top0, right0, p5, pointerAuto, zIndexHigh),
      },
      Button({
        onClick: () => {
          SplashModal.open()
        },
        variant: ButtonVariant.Secondary,
        children: helpButtonText,
      })
    )

  const SplashModal = Modal({
    content: () =>
      div(
        { ...classify(maxW600, mxAuto, p5, textCenter) },
        h1(
          {
            ...classify(textPrimary, text3xl, mb7, title),
          },
          title
        ),
        ...sections.map((section) =>
          div(
            { ...classify(mb7, textLeft) },
            h2({ ...classify(textPrimary, mb5) }, section.title),
            ...section.content.map((text) => p({ ...classify(textCcc, my5, content) }, text))
          )
        )
      ),
    buttons: [
      {
        text: primaryButtonText,
        onClick: dismissSplash,
        variant: ButtonVariant.Primary,
      },
    ],
  })

  return div(HelpButton(), SplashModal())
}
