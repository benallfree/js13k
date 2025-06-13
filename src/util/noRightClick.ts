export const noRightClick = (elem: HTMLElement) => {
  elem.addEventListener('contextmenu', function (event) {
    event.preventDefault()
  })
  return elem
}
