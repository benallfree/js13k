import { State } from 'vanjs-core'
import { div } from '../common/tags'
import styles from './StatusBar.module.css'

export const StatusBar = (statusMessage: State<string>, statusVisible: State<boolean>) =>
  div({ class: () => `${styles.statusBar} ${statusVisible.val ? styles.visible : ''}` }, () => statusMessage.val)
