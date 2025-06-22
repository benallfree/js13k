import { clickify } from '../clickify'
import { span } from '../tags'
import { _routerBasename, _routerPathname } from './_state'

interface LinkProps extends Partial<HTMLAnchorElement> {
  href: string
  replace?: boolean
}

export function Link({ replace, ...props }: LinkProps, ...children: (HTMLElement | string)[]) {
  const { href, ...rest } = props as HTMLAnchorElement

  const handleNavigation = (e: Event) => {
    e.preventDefault()

    if (!replace) window.history.pushState({}, '', _routerBasename.val + href)
    else window.history.replaceState({}, '', _routerBasename.val + href)

    // Update the global state of the router to trigger the Router
    if (href) _routerPathname.val = _routerBasename.val + href
  }

  const anchor = span(
    {
      ...rest,
      ...clickify(handleNavigation),
    },
    ...children
  )

  return anchor
}
