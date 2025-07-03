import {
  maxW600,
  mb5,
  mb7,
  mxAuto,
  my5,
  p5,
  text3xl,
  textCcc,
  textCenter,
  textLeft,
  textPrimary,
} from '@/styles.module.css'
import { ButtonVariant, Icon, Modal, classify, div, h1, h2, p, service, van } from '@van13k'

import { content } from './Splash.module.css'

export type SplashService = {
  modal: () => ReturnType<typeof Modal>
  icon: () => ReturnType<typeof Icon>
}

export interface SplashProps {
  title: string
  sections: {
    title: string
    content: string[]
  }[]
  storageKey?: string
  primaryButtonText?: string
  splashIcon?: string
}

export const Splash = ({
  title,
  sections,
  storageKey = 'splash-dismissed',
  primaryButtonText = 'Get Started',
  splashIcon = '💡',
}: SplashProps) => {
  const isOpen = van.state(!localStorage.getItem(storageKey))

  const dismissSplash = () => {
    localStorage.setItem(storageKey, 'true')
    isOpen.val = false
    SplashModal.close()
  }

  const SplashIcon = Icon({
    onClick: () => {
      SplashModal.open()
    },
    children: splashIcon,
  })

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

  const api: SplashService = {
    modal: () => SplashModal,
    icon: () => SplashIcon,
  }

  service<SplashService>(`splash`, api)

  return api
}

export const useSplash = () => {
  return service<SplashService>(`splash`)
}
