import { Player } from '@/types'
import { createHook, service } from '@/van13k'
import { IInputDevice, MovementConfig, MovementDelta, MovementState } from './MovementController'

export type IKeyboardInputDevice = IInputDevice

export const KeyboardInputDevice = () => {
  const pressedKeys = new Set<string>()

  window.addEventListener('keydown', (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    if (isValidKey(key)) {
      pressedKeys.add(key)
    }
  })
  window.addEventListener('keyup', (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()
    pressedKeys.delete(key)
  })

  const isValidKey = (key: string): boolean => {
    return ['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)
  }

  const getDelta = (
    currentPlayer: Player,
    state: MovementState,
    config: MovementConfig,
    deltaTime: number
  ): MovementDelta => {
    let deltaX = 0
    let deltaY = 0
    let deltaRotation = 0
    let newSpeed = state.currentSpeed

    // Handle speed buildup/decay
    const isAccelerating = pressedKeys.has('w') || pressedKeys.has('arrowup')
    const isReversing = pressedKeys.has('s') || pressedKeys.has('arrowdown')

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
    if (pressedKeys.has('a') || pressedKeys.has('arrowleft')) {
      deltaRotation -= config.maxRotationSpeed * deltaTime
    }

    if (pressedKeys.has('d') || pressedKeys.has('arrowright')) {
      deltaRotation += config.maxRotationSpeed * deltaTime
    }

    return {
      deltaX,
      deltaY,
      deltaRotation,
      newSpeed,
    }
  }

  service<IKeyboardInputDevice>('keyboardInput', {
    getDelta,
  })
}

export const useKeyboardInput = createHook<IKeyboardInputDevice>('keyboardInput')
