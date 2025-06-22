export type VanJsClass = string | (() => string)

export const classify = (...args: VanJsClass[]) => {
  return { class: () => args.map((arg) => (typeof arg === 'string' ? arg : arg())).join(' ') }
}
