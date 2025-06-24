import { button, classify, clickify } from '@van13k'
import {
  btn,
  btnActive,
  btnCancel,
  btnDanger,
  btnLg,
  btnMd,
  btnPrimary,
  btnSecondary,
  btnSm,
  btnSuccess,
} from './Button.module.css'

export enum ButtonVariant {
  Primary = 'primary',
  Danger = 'danger',
  Secondary = 'secondary',
  Cancel = 'cancel',
  Success = 'success',
}

export enum ButtonSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

const VARIANT_MAP = {
  [ButtonVariant.Primary]: btnPrimary,
  [ButtonVariant.Danger]: btnDanger,
  [ButtonVariant.Secondary]: btnSecondary,
  [ButtonVariant.Cancel]: btnCancel,
  [ButtonVariant.Success]: btnSuccess,
} as const

const SIZE_MAP = {
  [ButtonSize.Small]: btnSm,
  [ButtonSize.Medium]: btnMd,
  [ButtonSize.Large]: btnLg,
} as const

interface ButtonProps {
  onClick: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  isActive?: boolean
  children: any
}

export const Button = ({
  onClick,
  variant = ButtonVariant.Secondary,
  size = ButtonSize.Medium,
  className = '',
  isActive = false,
  children,
}: ButtonProps) => {
  return button(
    {
      ...clickify(onClick),
      ...classify(btn, VARIANT_MAP[variant], SIZE_MAP[size], isActive ? btnActive : '', className),
    },
    children
  )
}
