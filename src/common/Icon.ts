import { button } from '../common/tags'
import styles from './Icon.module.css'

interface IconProps {
  onClick: () => void
  active?: boolean
  class?: string
  children: any
}

export const Icon = ({ onClick, active = false, class: className = '', children }: IconProps) => {
  let classes = styles.iconBase

  if (active) {
    classes += ` ${styles.iconActive}`
  }

  if (className) {
    classes += ' ' + className
  }

  return button(
    {
      onclick: onClick,
      class: classes,
    },
    children
  )
}
