import { button } from '../common/tags'

interface IconProps {
  onClick: () => void
  active?: boolean
  class?: string
  children: any
}

export const Icon = ({ onClick, active = false, class: className = '', children }: IconProps) => {
  let classes = 'icon-base'

  if (active) {
    classes += ' icon-active'
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
