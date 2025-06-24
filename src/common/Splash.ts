import { div, h1, h2, p } from '@/common/tags'
import { classify } from '@/common/util/classify'
import globalStyles from '@/styles.module.css'
import van from 'vanjs-core'
import { Button, ButtonVariant } from './Button'
import { Modal } from './Modal'
import splashStyles from './Splash.module.css'

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
        ...classify(
          globalStyles.fixed,
          globalStyles.top0,
          globalStyles.right0,
          globalStyles.p5,
          globalStyles.pointerAuto,
          globalStyles.zIndexHigh
        ),
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
        { ...classify(globalStyles.maxW600, globalStyles.mxAuto, globalStyles.p5, globalStyles.textCenter) },
        h1(
          {
            ...classify(globalStyles.textPrimary, globalStyles.text3xl, globalStyles.mb7, splashStyles.title),
          },
          title
        ),
        ...sections.map((section) =>
          div(
            { ...classify(globalStyles.mb7, globalStyles.textLeft) },
            h2({ ...classify(globalStyles.textPrimary, globalStyles.mb5) }, section.title),
            ...section.content.map((text) =>
              p({ ...classify(globalStyles.textCcc, globalStyles.my5, splashStyles.content) }, text)
            )
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
