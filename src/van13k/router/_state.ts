import { van } from '@van13k'

export const _routerBasename = van.state('')
export const _routerPathname = van.state(window.location.pathname)
export const _routerParams = van.state<Record<string, string>>({})
export const _routerQuery = van.state<Record<string, string>>({})
