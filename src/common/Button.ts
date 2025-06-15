import { button } from '../common/tags'
import styles from './Button.module.css'

export enum ButtonVariant {
  Primary = 'primary',
  Danger = 'danger',
  Secondary = 'secondary',
  Cancel = 'cancel',
}

export enum ButtonSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

interface ButtonProps {
  onClick: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  class?: string
  children: any
}

const getButtonClasses = (
  variant: ButtonVariant = ButtonVariant.Secondary,
  size: ButtonSize = ButtonSize.Medium,
  className: string = ''
): string => {
  const classes = [styles.btn, styles[`btn-${variant}`]]

  if (size !== 'md') {
    classes.push(styles[`btn-${size}`])
  }

  if (className) {
    classes.push(className)
  }

  return classes.join(' ')
}

export const Button = ({
  onClick,
  variant = ButtonVariant.Secondary,
  size = ButtonSize.Medium,
  class: className = '',
  children,
}: ButtonProps) => {
  return button(
    {
      onclick: onClick,
      class: getButtonClasses(variant, size, className),
    },
    children
  )
}
