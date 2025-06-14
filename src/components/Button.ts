import van from 'vanjs-core'

const { button } = van.tags

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
  const classes = ['btn', `btn-${variant}`]

  if (size !== 'md') {
    classes.push(`btn-${size}`)
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
