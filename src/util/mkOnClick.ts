export type GenericMouseEventHandler<TEvent> = (e: TEvent) => void

export type PointerEventHandler = GenericMouseEventHandler<PointerEvent>

export const mkOnClick = (cb: PointerEventHandler, props?: MkOnProps) => {
  return mkOn('onclick', cb, props)
}

export type MouseEventHandler = GenericMouseEventHandler<MouseEvent>
export const mkOnMouseMove = (cb: MouseEventHandler, props?: MkOnProps) => {
  return mkOn('onmousemove', cb, props)
}

export const mkOnMouseDown = (cb: MouseEventHandler, props?: MkOnProps) => {
  return mkOn('onmousedown', cb, props)
}

export type MkOnProps = {
  targetOnly: boolean
}
export const mkOn = (
  eventName: 'onclick' | 'onmousedown' | 'onmousemove',
  cb: GenericMouseEventHandler<any>,
  props?: MkOnProps
) => {
  const { targetOnly } = { targetOnly: false, ...props }
  return {
    [eventName]: function (this: HTMLElement, e: PointerEvent | MouseEvent) {
      // console.log({ targetOnly, target: e.target })
      if (targetOnly && e.target !== this) return
      e.stopPropagation()
      cb?.(e)
    }
  }
}
