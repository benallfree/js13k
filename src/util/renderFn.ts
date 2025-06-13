export const getRenderFn = (code: string) => eval(`(${code})`)
export const checkRenderFn = (code: string) => {
  try {
    getRenderFn(code)
    return ''
  } catch (e) {
    return `${(e as Error).message}`
  }
}
