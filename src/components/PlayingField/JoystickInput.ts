import { classify, div, van } from '@van13k'
import { joystickActive, joystickContainer, joystickKnob } from './JoystickInput.module.css'

export const JoystickInput = (options?: { position?: string[] }) => {
  let currentInput = van.state({ force: 0, radians: 0 })
  let centerX = 0
  let centerY = 0
  const maxRadius = 40

  const isActive = van.state(false)

  const updateInputFromPosition = (clientX: number, clientY: number) => {
    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const constrainedDistance = Math.min(distance, maxRadius)
    const force = constrainedDistance / maxRadius

    // Calculate angle: 0 = North, π/2 = East, π = South, 3π/2 = West
    // atan2(deltaX, -deltaY) gives us the correct orientation
    let radians = Math.atan2(deltaX, -deltaY)

    // Normalize to 0-2π range
    if (radians < 0) {
      radians += 2 * Math.PI
    }

    currentInput.val = { force, radians }
  }

  const handlePointerDown = (event: PointerEvent) => {
    const element = event.currentTarget as HTMLElement
    isActive.val = true
    element.setPointerCapture(event.pointerId)

    const rect = element.getBoundingClientRect()
    centerX = rect.left + rect.width / 2
    centerY = rect.top + rect.height / 2

    updateInputFromPosition(event.clientX, event.clientY)
    event.preventDefault()
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (!isActive.val) return
    updateInputFromPosition(event.clientX, event.clientY)
    event.preventDefault()
  }

  const handlePointerUp = (event: PointerEvent) => {
    if (!isActive.val) return
    const element = event.currentTarget as HTMLElement
    isActive.val = false
    element.releasePointerCapture(event.pointerId)
    currentInput.val = { force: 0, radians: 0 }
    event.preventDefault()
  }

  const component = () =>
    div(
      {
        ...classify(joystickContainer, () => (isActive.val ? joystickActive : ''), ...(options?.position || [])),
        onpointerdown: handlePointerDown,
        onpointermove: handlePointerMove,
        onpointerup: handlePointerUp,
        onpointercancel: handlePointerUp,
      },
      div({
        ...classify(joystickKnob),
        style: () => {
          const x = Math.sin(currentInput.val.radians) * currentInput.val.force * maxRadius
          const y = -Math.cos(currentInput.val.radians) * currentInput.val.force * maxRadius

          return currentInput.val.force === 0
            ? `transform: translate(-50%, -50%);`
            : `transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px));`
        },
      })
    )
  return {
    component,
    getInput: () => currentInput.val,
  }
}
