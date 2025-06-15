import van, { State } from 'vanjs-core'
import styles from './StatusBar.module.css'

const { div } = van.tags

export const StatusBar = (statusMessage: State<string>, statusVisible: State<boolean>) =>
  div({ class: () => `${styles.statusBar} ${statusVisible.val ? styles.visible : ''}` }, () => statusMessage.val)
