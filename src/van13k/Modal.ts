import globalStyles from '@styles'
import { Button, ButtonVariant, classify, clickify, div, VanValue } from '@van13k'
import van, { State } from 'vanjs-core'

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
    if (target.classList.contains(globalStyles.bgOverlay)) {
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
            globalStyles.fixed,
            globalStyles.top0,
            globalStyles.left0,
            globalStyles.right0,
            globalStyles.bottom0,
            globalStyles.bgOverlay,
            globalStyles.flex,
            globalStyles.itemsCenter,
            globalStyles.justifyCenter,
            globalStyles.zIndexHighest,
            globalStyles.overflowHidden,
            globalStyles.pointerAuto
          ),
          ...clickify(handleOutsideClick),
        },
        div(
          {
            ...classify(
              globalStyles.bgGray200,
              globalStyles.border2,
              globalStyles.borderGray500,
              globalStyles.roundedLg,
              globalStyles.w90vw,
              globalStyles.maxW600,
              globalStyles.maxH90vh,
              globalStyles.flex,
              globalStyles.flexCol,
              globalStyles.relative,
              globalStyles.shadowLg,
              globalStyles.overflowHidden,
              globalStyles.pointerAuto
            ),
          },
          title &&
            div(
              {
                ...classify(
                  globalStyles.textLg,
                  globalStyles.fontBold,
                  globalStyles.p6,
                  globalStyles.pb5,
                  globalStyles.textWhite
                ),
              },
              title
            ),
          div(
            {
              ...classify(
                globalStyles.px6,
                globalStyles.overflowYAuto,
                globalStyles.flex1,
                globalStyles.textCcc,
                globalStyles.lineHeightNormal,
                globalStyles.pb5
              ),
            },
            content
          ),
          () =>
            buttons?.length &&
            div(
              {
                ...classify(
                  globalStyles.flex,
                  globalStyles.gap4,
                  globalStyles.justifyEnd,
                  globalStyles.p6,
                  globalStyles.borderT,
                  globalStyles.borderGray400,
                  globalStyles.bgGray200
                ),
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
