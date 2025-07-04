import { div, Link, useSplash } from '@van13k'

export const NavBar = () => {
  const splash = useSplash()

  return div(
    { class: 'fixed top-0 left-0 right-0 flex justify-between items-center p-2 bg-black/50 z-50' },
    div({ class: 'flex-shrink-0' }, Link({ href: '/' }, '🎲 Fabletop 🎲')),
    div({ class: 'flex gap-2 flex-shrink-0' }, splash.icon())
  )
}
