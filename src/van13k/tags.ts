import van from 'vanjs-core'

const { div, span, button, input, textarea, select, option, label, form, h1, h2, h3, h4, h5, h6, a, p, img, canvas } =
  van.tags

export { a, button, canvas, div, form, h1, h2, h3, h4, h5, h6, img, input, label, option, p, select, span, textarea }

export type VanValueBase = string | number | boolean | null | undefined | HTMLElement
export type VanValue = VanValueBase | (() => VanValueBase)
