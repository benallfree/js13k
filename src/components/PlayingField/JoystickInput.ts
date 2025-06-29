import { Player } from '@/types'
import { classify, createHook, div, service, van } from '@van13k'
import { joystickActive, joystickContainer, joystickKnob } from './JoystickInput.module.css'
import { IDeviceUI, IInputDevice, MovementConfig, MovementDelta, MovementState } from './MovementController'

export type IJoystickInputDevice = IInputDevice & IDeviceUI

export const JoystickInputDevice = () => {
  const currentInput = van.state({ force: 0, radians: 0 })
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

  const getDelta = (
    currentPlayer: Player,
    state: MovementState,
    config: MovementConfig,
    deltaTime: number
  ): MovementDelta => {
    const input = currentInput.val
    let deltaX = 0
    let deltaY = 0
    let deltaRotation = 0
    let newSpeed = state.currentSpeed

    // Handle speed buildup/decay based on input force
    if (input.force > 0) {
      // Build up speed based on input force
      const targetSpeed = config.maxSpeed * input.force
      if (newSpeed < targetSpeed) {
        newSpeed = Math.min(targetSpeed, newSpeed + config.acceleration * deltaTime)
      } else if (newSpeed > targetSpeed) {
        newSpeed = Math.max(targetSpeed, newSpeed - config.deceleration * deltaTime)
      }
    } else {
      // Decay speed toward zero
      if (newSpeed > 0) {
        newSpeed = Math.max(0, newSpeed - config.deceleration * deltaTime)
      } else if (newSpeed < 0) {
        newSpeed = Math.min(0, newSpeed + config.deceleration * deltaTime)
      }
    }

    // Apply movement based on current speed and input direction
    if (newSpeed !== 0 && input.force > 0) {
      deltaX += Math.sin(input.radians) * newSpeed * deltaTime
      deltaY += -Math.cos(input.radians) * newSpeed * deltaTime

      // Apply rotation to face the movement direction
      const targetRotation = input.radians
      const currentRotation = currentPlayer.rotation.z

      // Calculate shortest rotation path (handle wrapping around 2π)
      let rotationDiff = targetRotation - currentRotation
      while (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI
      while (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI

      // Apply rotation smoothly
      if (Math.abs(rotationDiff) > 0.1) {
        const maxRotation = config.maxRotationSpeed * deltaTime
        deltaRotation = Math.sign(rotationDiff) * Math.min(Math.abs(rotationDiff), maxRotation)
      }
    }

    return {
      deltaX,
      deltaY,
      deltaRotation,
      newSpeed,
    }
  }

  const getComponent = () =>
    div(
      {
        ...classify(joystickContainer, () => (isActive.val ? joystickActive : '')),
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

  service<IJoystickInputDevice>('joystickInput', {
    getComponent,
    getDelta,
  })
}

export const useJoystickInput = createHook<IJoystickInputDevice>('joystickInput')
