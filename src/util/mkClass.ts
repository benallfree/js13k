export const TILE = 'tile'
export const LAYER = 'layer'
export const INTERACTIVE = 'interactive'
export const CONTAINER = 'container'
export const CLEARFIX = `clearfix`
export const NOSELECT = `no-select`
export const PULSING = `pulsing`
export const DANGER = `danger`
export const SUCCESS = `success`

export const mkClass = (...args: (string | string[])[]) => ({
  class: args.map((arg) => (Array.isArray(arg) ? arg.join(' ') : arg)).join(' ')
})
