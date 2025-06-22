import styles from './BottomTray.module.css'
import { Icon } from './Icon'
import { div } from './tags'

export interface BottomTrayIconConfig {
  children: string | (() => string)
  onClick: () => void
}

interface BottomTrayProps {
  icons: BottomTrayIconConfig[]
}

export const BottomTray = ({ icons }: BottomTrayProps) => {
  return div({ class: styles.bottomTray }, ...icons.map((iconConfig) => Icon(iconConfig)))
}
