export const ensureStyle = (styleId: string, css: string, gc: boolean) => {
  const e = document.getElementById(styleId)
  if (e && !gc) {
    return
  }
  if (e && gc) {
    e.remove()
  }
  const style = document.createElement('style')
  style.type = 'text/css'
  style.id = styleId
  style.appendChild(document.createTextNode(css))
  document.head.appendChild(style)
  // console.log(css)
}
