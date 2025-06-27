import { Button, ButtonVariant, classify, clickify, div, VanValue } from '@van13k'
import van, { State } from 'vanjs-core'
import {
  bgGray200,
  bgOverlay,
  border2,
  borderGray400,
  borderGray500,
  borderT,
  bottom0,
  fixed,
  flex,
  flex1,
  flexCol,
  fontBold,
  gap4,
  itemsCenter,
  justifyCenter,
  justifyEnd,
  left0,
  lineHeightNormal,
  maxH90vh,
  maxW600,
  overflowHidden,
  overflowYAuto,
  p6,
  pb5,
  pointerAuto,
  px6,
  relative,
  right0,
  roundedLg,
  shadowLg,
  textCcc,
  textLg,
  textWhite,
  top0,
  w90vw,
  zIndexHighest,
} from '../styles.module.css'

/**
 * Modal state management utility
 * Provides consistent modal state and operations across the application
 */
export interface ModalManager {
  isOpen: State<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}

/**
 * Creates a modal state manager with consistent operations
 * @param initialState - Initial modal state (default: false)
 * @returns ModalManager object with state and operations
 */
export const useModal = (initialState: boolean = false): ModalManager => {
  const isOpen = van.state(initialState)

  const open = () => {
    isOpen.val = true
  }

  const close = () => {
    isOpen.val = false
  }

  const toggle = () => {
    isOpen.val = !isOpen.val
  }

  return {
    isOpen,
    open,
    close,
    toggle,
  }
}

export interface ButtonProps {
  text: VanValue
  onClick?: () => void
  variant?: ButtonVariant
}

export type ModalProps<TOpenParams extends Record<string, any>> = {
  title?: VanValue
  content: VanValue
  buttons?: ButtonProps[]
  onOpen?: (params?: TOpenParams) => void
  onClose?: () => void
}

export const Modal = <TOpenParams extends Record<string, any>>({
  title,
  content,
  buttons,
  onOpen,
  onClose,
}: ModalProps<TOpenParams>) => {
  const isOpen = van.state(false)
  const handleOutsideClick = (e: Event) => {
    const target = e.target as HTMLElement
    if (target.classList.contains(bgOverlay)) {
      const cancelButton = buttons?.find((button) => button.variant === ButtonVariant.Cancel)
      cancelButton?.onClick?.()
      isOpen.val = false
    }
  }

  const openParams = van.state<TOpenParams | undefined>(undefined)
  const open = (params?: TOpenParams) => {
    console.log(`Modal '${title}' opened`)
    isOpen.val = true
    openParams.val = params
    onOpen?.(params)
  }

  const close = () => {
    console.log(`Modal '${title}' closed`)
    isOpen.val = false
    onClose?.()
  }

  const component = () =>
    div(() => {
      // Lock body scroll when modal is open
      van.derive(() => {
        document.body.style.overflow = isOpen.val ? 'hidden' : ''
      })

      if (!isOpen.val) return div(``)
      return div(
        {
          ...classify(
            fixed,
            top0,
            left0,
            right0,
            bottom0,
            bgOverlay,
            flex,
            itemsCenter,
            justifyCenter,
            zIndexHighest,
            overflowHidden,
            pointerAuto
          ),
          ...clickify(handleOutsideClick),
        },
        div(
          {
            ...classify(
              bgGray200,
              border2,
              borderGray500,
              roundedLg,
              w90vw,
              maxW600,
              maxH90vh,
              flex,
              flexCol,
              relative,
              shadowLg,
              overflowHidden,
              pointerAuto
            ),
          },
          title &&
            div(
              {
                ...classify(textLg, fontBold, p6, pb5, textWhite),
              },
              title
            ),
          div(
            {
              ...classify(px6, overflowYAuto, flex1, textCcc, lineHeightNormal, pb5),
            },
            content
          ),
          () =>
            buttons?.length &&
            div(
              {
                ...classify(flex, gap4, justifyEnd, p6, borderT, borderGray400, bgGray200),
              },
              buttons?.map((button) =>
                Button({
                  onClick: () => {
                    button.onClick?.()
                    isOpen.val = false
                  },
                  variant: button.variant || ButtonVariant.Primary,
                  children: button.text,
                })
              )
            )
        )
      )
    })

  // Attach methods to the render function
  component.open = open
  component.close = close

  return component
}
