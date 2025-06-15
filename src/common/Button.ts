import { button } from '../common/tags'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'danger' | 'secondary'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  onClick: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  class?: string
  children: any
}

const getButtonClasses = (
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
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
  variant = 'secondary',
  size = 'md',
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
