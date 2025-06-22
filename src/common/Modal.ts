import { State } from 'vanjs-core'
import { classify } from '../common/utils'
import globalStyles from '../components/common.module.css'
import { Button, ButtonVariant } from './Button'
import { clickify } from './clickify'
import { div } from './tags'

export interface ButtonProps {
  text: string
  onClick: () => void
  variant?: ButtonVariant
}

export interface ModalProps {
  isOpen: State<boolean>
  title?: string
  content: () => any
  buttons?: ButtonProps[]
}

export const Modal =
  ({ isOpen, title, content, buttons }: ModalProps) =>
  () => {
    const handleOutsideClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.classList.contains(globalStyles.bgOverlay)) {
        const cancelButton = buttons?.find((button) => button.variant === ButtonVariant.Cancel)
        cancelButton?.onClick()
        isOpen.val = false
      }
    }

    return isOpen.val
      ? div(
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
              content()
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
                      button.onClick()
                      isOpen.val = false
                    },
                    variant: button.variant || ButtonVariant.Primary,
                    children: button.text,
                  })
                )
              )
          )
        )
      : ''
  }
