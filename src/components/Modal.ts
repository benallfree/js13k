import { INTERACTIVE, LAYER, assert, mkClass, mkOnClick, nextTick } from '@/util'
import { ChildDom, State, bind, div, state } from '@/van'
import { nanoid } from 'nanoid'
import { Opaque } from 'type-fest'

type ModalId = Opaque<ReturnType<typeof nanoid>, 'modal-id'>
export const newModalId = () => nanoid() as ModalId
export const mkModalId = (s: string) => s as ModalId
type ModalBodyRenderFunc = () => ChildDom
type OpenProps = {
  title: ModalBodyRenderFunc
  body: ModalBodyRenderFunc
  event?: ClientXY
  onClosed?: () => void
  onCloseClicked?: () => void
  onClickAway?: () => void
  id?: ModalId
}
type ModalElement = Opaque<() => ReturnType<typeof bind>, 'modal-render-func'>
type ModalOpener = (props: OpenProps) => Promise<void>
type ModalCloser = () => Promise<void>
type ClientXY = { pageX: number; pageY: number }

function positionDivAroundMouse(div: HTMLDivElement, event: ClientXY) {
  // console.log({ div, event })
  // Get the current mouse position
  const mouseX = event.pageX
  const mouseY = event.pageY

  // Get the dimensions of the div
  const divWidth = div.offsetWidth
  const divHeight = div.offsetHeight

  // Get the dimensions of the window
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  // Calculate the maximum allowed positions for the div
  const maxLeft = windowWidth - divWidth
  const maxTop = windowHeight - divHeight

  // Calculate the desired position of the div
  let left = mouseX
  let top = mouseY

  // Adjust the position if the div overflows the window
  if (left > maxLeft) {
    left = maxLeft
  }

  if (top > maxTop) {
    top = maxTop
  }

  // Set the position of the div
  div.style.left = left + 'px'
  div.style.top = top + 'px'
  div.style.transform = 'none'
}

type OpenState = State<boolean>
type ModalResult = [ModalElement, ModalOpener, ModalCloser, OpenState]

export const Modal = (): ModalResult => {
  const id = newModalId()
  const isOpen = state(false)
  const openProps = state<OpenProps>({
    title: () => `New Modal`,
    body: () => div(`Empty modal body`)
  })

  isOpen.onnew((isOpen) => {
    setTimeout(() => {
      // console.log({ isOpen })
      const { event } = openProps.val
      if (!isOpen || !event) return
      const root = document.getElementById(id) as HTMLDivElement | undefined
      // console.log({ root, id })
      assert(root)
      positionDivAroundMouse(root, event)
    }, 0)
  })

  const open: ModalOpener = async (props) => {
    openProps.val = { ...props }
    isOpen.val = true
    await nextTick()
  }

  const close: ModalCloser = async () => {
    isOpen.val = false
    await nextTick()
    openProps.val.onClosed?.()
    await nextTick()
  }

  const element = (() => {
    return bind(isOpen, openProps, (isOpen, openProps) => {
      if (!isOpen) return div()
      const { title, event, body, onClickAway, onCloseClicked } = openProps
      return div(
        {
          ...mkClass(event ? '' : ['modal-overlay', LAYER]),
          ...mkOnClick(
            () => {
              onClickAway?.()
              close().catch(console.error)
            },
            { targetOnly: true }
          )
        },
        div(
          { id, ...mkClass(`Modal`) },
          div({ ...mkClass(`title`, LAYER) }, title()),
          div(
            {
              ...mkClass(`close`, INTERACTIVE),
              ...mkOnClick(() => {
                onCloseClicked?.()
                close().catch(console.error)
              })
            },
            `❌`
          ),
          div({ ...mkClass(`body`) }, body())
        )
      )
    })
  }) as ModalElement

  return [element, open, close, isOpen]
}
