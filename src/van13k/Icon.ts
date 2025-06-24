import { classify } from '@/van13k/util/classify'
import { Button, ButtonSize, ButtonVariant } from './Button'
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
