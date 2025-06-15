import van, { State } from 'vanjs-core'

const { div } = van.tags

export const StatusBar = (statusMessage: State<string>, statusVisible: State<boolean>) =>
  div({ class: () => `status-bar ${statusVisible.val ? 'visible' : ''}` }, () => statusMessage.val)
