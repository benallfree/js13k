import { Player } from '@/types'
import { classify, div, van } from '@van13k'
import { joystickActive, joystickContainer, joystickKnob } from './JoystickInput.module.css'
import { IInputDevice, MovementConfig, MovementDelta, MovementState } from './MovementController'

export class JoystickInputDevice implements IInputDevice {
  private currentInput = van.state({ force: 0, radians: 0 })
  private centerX = 0
  private centerY = 0
  private readonly maxRadius = 40
  private readonly isActive = van.state(false)

  constructor() {}

  private updateInputFromPosition = (clientX: number, clientY: number) => {
    const deltaX = clientX - this.centerX
    const deltaY = clientY - this.centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const constrainedDistance = Math.min(distance, this.maxRadius)
    const force = constrainedDistance / this.maxRadius

    // Calculate angle: 0 = North, π/2 = East, π = South, 3π/2 = West
    // atan2(deltaX, -deltaY) gives us the correct orientation
    let radians = Math.atan2(deltaX, -deltaY)

    // Normalize to 0-2π range
    if (radians < 0) {
      radians += 2 * Math.PI
    }

    this.currentInput.val = { force, radians }
  }

  private handlePointerDown = (event: PointerEvent) => {
    const element = event.currentTarget as HTMLElement
    this.isActive.val = true
    element.setPointerCapture(event.pointerId)

    const rect = element.getBoundingClientRect()
    this.centerX = rect.left + rect.width / 2
    this.centerY = rect.top + rect.height / 2

    this.updateInputFromPosition(event.clientX, event.clientY)
    event.preventDefault()
  }

  private handlePointerMove = (event: PointerEvent) => {
    if (!this.isActive.val) return
    this.updateInputFromPosition(event.clientX, event.clientY)
    event.preventDefault()
  }

  private handlePointerUp = (event: PointerEvent) => {
    if (!this.isActive.val) return
    const element = event.currentTarget as HTMLElement
    this.isActive.val = false
    element.releasePointerCapture(event.pointerId)
    this.currentInput.val = { force: 0, radians: 0 }
    event.preventDefault()
  }

  getDelta(currentPlayer: Player, state: MovementState, config: MovementConfig, deltaTime: number): MovementDelta {
    const input = this.currentInput.val
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

  getComponent = () =>
    div(
      {
        ...classify(joystickContainer, () => (this.isActive.val ? joystickActive : '')),
        onpointerdown: this.handlePointerDown,
        onpointermove: this.handlePointerMove,
        onpointerup: this.handlePointerUp,
        onpointercancel: this.handlePointerUp,
      },
      div({
        ...classify(joystickKnob),
        style: () => {
          const x = Math.sin(this.currentInput.val.radians) * this.currentInput.val.force * this.maxRadius
          const y = -Math.cos(this.currentInput.val.radians) * this.currentInput.val.force * this.maxRadius

          return this.currentInput.val.force === 0
            ? `transform: translate(-50%, -50%);`
            : `transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px));`
        },
      })
    )
}
