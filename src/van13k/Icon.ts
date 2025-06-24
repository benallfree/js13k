import { Button, ButtonSize, ButtonVariant, classify } from '@van13k'
import styles from './Button.module.css'

interface IconProps {
  onClick: () => void
  active?: boolean
  class?: string
  children: any
}

export const Icon = ({ onClick, active = false, class: className = '', children }: IconProps) => {
  return Button({
    onClick,
    variant: active ? ButtonVariant.Primary : ButtonVariant.Cancel,
    size: ButtonSize.Medium,
    ...classify(styles.btn, styles.btnIcon, className),
    isActive: active,
    children,
  })
}
