import { Icon, div } from '@van13k'
import styles from './BottomTray.module.css'

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
