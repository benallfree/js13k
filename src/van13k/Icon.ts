import { Button, ButtonSize, ButtonVariant, classify, Router } from '@van13k'
import styles from './Button.module.css'

interface IconProps {
  onClick: () => void
  active?: boolean
  class?: string
  path?: string
  children: any
}

export const Icon = ({ onClick, active = false, class: className = '', path, children }: IconProps) => {
  const b = () =>
    Button({
      onClick,
      variant: active ? ButtonVariant.Primary : ButtonVariant.Cancel,
      size: ButtonSize.Medium,
      ...classify(styles.btn, styles.btnIcon, className),
      isActive: active,
      children,
    })
  if (path) {
    return Router({
      routes: [{ path, component: b }],
    })
  }
  return b()
}
