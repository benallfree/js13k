import { Player } from '@/types'
import { IInputDevice, MovementConfig, MovementDelta, MovementState } from './MovementController'

export class KeyboardInputDevice implements IInputDevice {
  private pressedKeys = new Set<string>()
  private isListening = false

  constructor() {
    this.start()
  }

  start() {
    if (this.isListening) return
    this.isListening = true

    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))
  }

  stop() {
    if (!this.isListening) return
    this.isListening = false

    window.removeEventListener('keydown', this.handleKeyDown.bind(this))
    window.removeEventListener('keyup', this.handleKeyUp.bind(this))

    this.pressedKeys.clear()
  }

  private handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    if (this.isValidKey(key)) {
      this.pressedKeys.add(key)
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    this.pressedKeys.delete(key)
  }

  private isValidKey(key: string): boolean {
    return ['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)
  }

  getDelta(currentPlayer: Player, state: MovementState, config: MovementConfig, deltaTime: number): MovementDelta {
    let deltaX = 0
    let deltaY = 0
    let deltaRotation = 0
    let newSpeed = state.currentSpeed

    // Handle speed buildup/decay
    const isAccelerating = this.pressedKeys.has('w') || this.pressedKeys.has('arrowup')
    const isReversing = this.pressedKeys.has('s') || this.pressedKeys.has('arrowdown')

    if (isAccelerating) {
      // Build up forward speed
      newSpeed = Math.min(config.maxSpeed, newSpeed + config.acceleration * deltaTime)
    } else if (isReversing) {
      // Build up reverse speed (negative)
      newSpeed = Math.max(-config.maxSpeed, newSpeed - config.acceleration * deltaTime)
    } else {
      // Decay speed toward zero
      if (newSpeed > 0) {
        newSpeed = Math.max(0, newSpeed - config.deceleration * deltaTime)
      } else if (newSpeed < 0) {
        newSpeed = Math.min(0, newSpeed + config.deceleration * deltaTime)
      }
    }

    // Apply movement based on current speed
    if (newSpeed !== 0) {
      deltaX += Math.sin(currentPlayer.rotation.z) * newSpeed * deltaTime
      deltaY += -Math.cos(currentPlayer.rotation.z) * newSpeed * deltaTime
    }

    // Handle rotation - works both when moving and when stationary (turning in place)
    if (this.pressedKeys.has('a') || this.pressedKeys.has('arrowleft')) {
      deltaRotation -= config.maxRotationSpeed * deltaTime
    }

    if (this.pressedKeys.has('d') || this.pressedKeys.has('arrowright')) {
      deltaRotation += config.maxRotationSpeed * deltaTime
    }

    return {
      deltaX,
      deltaY,
      deltaRotation,
      newSpeed,
    }
  }
}
