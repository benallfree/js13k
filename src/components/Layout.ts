import { div, Icon, useSplash } from '@van13k'
import { HostModal } from './HostModal'
import { JoinModal } from './JoinModal'

export const Layout = (...children: HTMLElement[]) => {
  const splash = useSplash()

  const showHostUI = () => {
    hostModal.open()
  }

  const showJoinUI = () => {
    joinModal.open()
  }

  const hostModal = HostModal()
  const joinModal = JoinModal()

  return div(
    div(
      { class: 'flex justify-between items-center m-2' },
      div({ class: 'flex-shrink-0' }, '🎲 Fabletop 🎲'),
      div(
        { class: 'flex gap-2 flex-shrink-0' },
        Icon({ onClick: showHostUI, children: '🏠' }),
        Icon({ onClick: showJoinUI, children: '➕' }),
        splash.icon()
      )
    ),
    joinModal(),
    hostModal(),
    ...children
  )
}
