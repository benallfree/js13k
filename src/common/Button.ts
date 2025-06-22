import { button } from '../common/tags'
import styles from './Button.module.css'
import { classify } from './classify'
import { clickify } from './clickify'

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
  [ButtonVariant.Primary]: styles.btnPrimary,
  [ButtonVariant.Danger]: styles.btnDanger,
  [ButtonVariant.Secondary]: styles.btnSecondary,
  [ButtonVariant.Cancel]: styles.btnCancel,
  [ButtonVariant.Success]: styles.btnSuccess,
} as const

const SIZE_MAP = {
  [ButtonSize.Small]: styles.btnSm,
  [ButtonSize.Medium]: styles.btnMd,
  [ButtonSize.Large]: styles.btnLg,
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
      ...classify(styles.btn, VARIANT_MAP[variant], SIZE_MAP[size], isActive ? styles.btnActive : '', className),
    },
    children
  )
}
