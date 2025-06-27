export type VanJsComponent = (...args: any[]) => HTMLElement
export type VanJsAttributeValue = string | ((...args: any[]) => string)

export const classify = (...args: VanJsAttributeValue[]) => {
  return { class: () => args.map((arg) => (typeof arg === 'string' ? arg : arg())).join(' ') }
}
